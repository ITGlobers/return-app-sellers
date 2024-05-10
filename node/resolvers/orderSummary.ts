import { ResolverError, UserInputError } from '@vtex/api'

import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'
import type { OrderSummary } from '../../typings/Summary'
import getSummaryService from '../services/summary/getSummaryService'

export const orderSummary = async (
  _: unknown,
  args: { orderId: string },
  ctx: Context
): Promise<OrderSummary> => {
  const { orderId } = args
  const {
    clients: { returnSettings, account: accountClient, settingsAccount },
  } = ctx

  const accountInfo = await accountClient.getInfo()

  let appConfig: Settings = DEFAULT_SETTINGS

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName:
      accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig,
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }

  // For requests where orderId is an empty string
  if (!orderId) {
    throw new UserInputError('Order ID is missing')
  }
  return getSummaryService(ctx, orderId)
}
