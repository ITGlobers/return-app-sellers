import { Settings } from '../../clients/settings'

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

const getSummaryService = async (ctx: Context, orderId: string) => {
  const {
    clients: { summary, account: accountClient, settingsAccount, oms },
  } = ctx
  let appConfig: Settings = DEFAULT_SETTINGS
  const accountInfo = await accountClient.getInfo()
  console.log('accountInfo', accountInfo)
  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }
  const payload = {
    parentAccountName:
      accountInfo?.parentAccountName || appConfig?.parentAccountName,
    orderId,
  }
  const response = await summary.getSummaryByOrderId(payload)
  const order = await oms.getOrder(orderId)

  return {
    ...response,
    creationDate: order.creationDate,
  }
}

export default getSummaryService
