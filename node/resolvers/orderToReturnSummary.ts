import { ResolverError, UserInputError } from '@vtex/api'

import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import { getCustomerEmail } from '../utils/getCostumerEmail'
import { OrderToReturnSummary } from '../../typings/OrdertoReturn'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const orderToReturnSummary = async (
  _: unknown,
  args: { orderId: string; storeUserEmail?: string },
  ctx: Context
): Promise<OrderToReturnSummary> => {
  const { orderId, storeUserEmail } = args
  const {
    state: { userProfile, appkey },
    clients: {
      returnSettings,
      oms,
      order: orderRequestClient,
      catalog,
      catalogGQL,
      account :accountClient,
      settingsAccount,
    },
    vtex: { logger },
  } = ctx

  const accountInfo = await accountClient.getInfo()
  
  let appConfig: Settings = DEFAULT_SETTINGS
  if(!accountInfo?.parentAccountName){
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName: accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }
  const { maxDays, excludedCategories } = settings

  // For requests where orderId is an empty string
  if (!orderId) {
    throw new UserInputError('Order ID is missing')
  }

  const order = await oms.order(orderId)

  const { creationDate, clientProfileData, status } = order

  isUserAllowed({
    requesterUser: userProfile,
    clientProfile: clientProfileData,
    appkey,
  })

  canOrderBeReturned({
    creationDate,
    maxDays,
    status,
  })

  const customerEmail = getCustomerEmail(
    clientProfileData,
    {
      userProfile,
      appkey,
      inputEmail: storeUserEmail || clientProfileData?.email,
    },
    {
      logger,
    }
  )
  
  return createOrdersToReturnSummary(
    order,
    customerEmail,
    accountInfo?.parentAccountName ? {...accountInfo, isSellerPortal: false} : {...appConfig, isSellerPortal: true, accountName: accountInfo.accountName},
    {
    excludedCategories,
    orderRequestClient,
    catalog,
    catalogGQL
  })
}
