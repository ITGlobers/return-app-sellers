import { ResolverError, UserInputError } from '@vtex/api'
import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import type { OrderToReturnSummary } from '../../typings/OrdertoReturn'
import { DEFAULT_SETTINGS } from '../clients/settings'
import orderToReturnSummaryService from '../services/summary/orderToReturnSummaryService'

export const orderToReturnSummary = async (
  _: unknown,
  args: { orderId: string; storeUserEmail?: string },
  ctx: Context
): Promise<OrderToReturnSummary> => {
  const { orderId, storeUserEmail } = args
  const {
    state: { userProfile, appkey },
    clients: { returnSettings, oms, account: accountClient, settingsAccount },
  } = ctx

  const accountInfo = await accountClient.getInfo()
  const appConfig = accountInfo?.parentAccountName
    ? DEFAULT_SETTINGS
    : await settingsAccount.getSettings(ctx)

  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName:
      accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig,
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }

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
    maxDays: settings.maxDays,
    status,
    orderStatus: settings.orderStatus,
  })

  return orderToReturnSummaryService(
    ctx,
    order,
    accountInfo,
    settings,
    appConfig,
    storeUserEmail
  )
}
