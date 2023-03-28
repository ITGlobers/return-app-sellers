import { ResolverError, UserInputError } from '@vtex/api'
import type { OrderToReturnSummary } from 'vtexromania.obi-return-app-sellers'

import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import { getCustomerEmail } from '../utils/getCostumerEmail'

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
      return: returnRequestClient,
      catalogGQL,
      account :accountClient,

    },
    vtex: { logger },
  } = ctx

  const accountInfo = await accountClient.getInfo()  
  const settings = await returnSettings.getReturnSettings(accountInfo)


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
      inputEmail: storeUserEmail,
    },
    {
      logger,
    }
  )

  return createOrdersToReturnSummary(order, customerEmail, {
    excludedCategories,
    returnRequestClient,
    catalogGQL,
    accountClient
  })
}
