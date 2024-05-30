import type { Settings } from '../../clients/settings'
import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import { getErrorLog } from '../../typings/error'

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

export const createGoodwillService = async (
  ctx: Context,
  goodwill: Goodwill
): Promise<{ message: string; goodwill: Goodwill }> => {
  const {
    clients: {
      oms,
      goodwill: goodwillClient,
      account: accountClient,
      settingsAccount,
    },
  } = ctx

  let appConfig: Settings = DEFAULT_SETTINGS
  const accountInfo = await accountClient.getInfo()

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const parentAccountName =
    accountInfo?.parentAccountName || appConfig?.parentAccountName

  goodwill.sellerId = accountInfo.accountName

  const payload = {
    parentAccountName,
    goodwill: {
      ...goodwill,
      orderId: goodwill.orderId,
    },
    auth: appConfig,
  }

  const goodwillDraft = await goodwillClient.createGoodwillSeller(payload)

  try {
    ctx.state.logs.push({
      message: 'Request received',
      middleware: `Service create invoice Goodwill from ${goodwill.orderId}`,
      severity: ExternalLogSeverity.INFO,
      payload: {
        details: 'Body of the request captured',
        stack: JSON.stringify(goodwillDraft.invoicesData),
      },
    })
    await oms.createInvoice(goodwill.orderId, goodwillDraft.invoicesData)
  } catch (error) {
    await goodwillClient.updateGoodwillSeller({
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      goodwill: {
        sellerId: accountInfo.accountName,
        id: goodwillDraft.data?.DocumentId,
        status: 403,
        message: JSON.stringify(error?.response?.data) || error,
      },
      auth: appConfig,
    })
    ctx.status = 400
    const message = `Cant create Invoice goodwill ${
      error?.response?.data?.error?.message ||
      JSON.stringify(error?.response?.data) ||
      error.message ||
      error
    }`

    throw new Error(getErrorLog(message, 'INV011'))
  }

  await goodwillClient.updateGoodwillSeller({
    parentAccountName:
      accountInfo?.parentAccountName || appConfig?.parentAccountName,
    goodwill: {
      sellerId: accountInfo.accountName,
      id: goodwillDraft.data.DocumentId,
      status: 200,
      message: 'Goodwill invoiced successfully',
    },
    auth: appConfig,
  })

  return {
    message: `Goodwill created successfully for orderId: ${goodwill.orderId}`,
    goodwill,
  }
}

export default createGoodwillService
