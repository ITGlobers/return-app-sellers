import { Settings } from "../../clients/settings"

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

const getGoodwillService = async (ctx: Context, id?: string) => {
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
  const payload = {
    parentAccountName: accountInfo?.parentAccountName || appConfig?.parentAccountName,
    auth: appConfig,
    sellerID: accountInfo.accountName, 
    id
  }

  const response = await goodwillClient.getGoodwillSeller(payload)

  return {
    ...response,
  }
}

export default getGoodwillService
