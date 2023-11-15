import { Settings } from "../../clients/settings"

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

const createGoodwillService = async (ctx: Context, goodwill: SellerGoodwill) => {
  const {
    clients: { 
      goodwill: goodwillClient,
      account :accountClient,
      settingsAccount
    },
  } = ctx
  let appConfig: Settings = DEFAULT_SETTINGS
  const accountInfo = await accountClient.getInfo()
  if(!accountInfo?.parentAccountName){
    appConfig = await settingsAccount.getSettings(ctx)
  }
  goodwill.sellerId = accountInfo.accountName
  const payload = {
    parentAccountName: accountInfo?.parentAccountName || appConfig?.parentAccountName,
    goodwill,
    auth: appConfig
  }

  await goodwillClient.createGoodwillSeller(payload)

  return {
    message: `Goodwill created successfully for orderId: ${goodwill.orderId}`,
    goodwill,
  }
}

export default createGoodwillService
