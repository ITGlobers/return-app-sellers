import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

type Args = {
  dateSubmitted: string
}

export const exportReturn = async (
  _: unknown,
  {dateSubmitted}: Args,
  ctx: Context
) => {

  const { clients: {
    return: returnRequestClient,
    account: accountClient,
    settingsAccount
  } } = ctx;

  try {
    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if(!accountInfo?.parentAccountName){
      appConfig = await settingsAccount.getSettings(ctx)
    }
    
    const response = await returnRequestClient.exportReturn({
      dateSubmitted,
      parentAccountName: accountInfo?.parentAccountName || appConfig?.parentAccountName,
    })

    return {
      file: response
    }
  } catch (error) {
    return error;
  }
}
