import type { MutationSaveReturnAppSettingsArgs, ReturnAppSettings } from '../../typings/ReturnAppSettings'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

import {
  validateMaxDaysCustomReasons,
  validatePaymentOptions,
  valideteUniqueCustomReasonsPerLocale,
} from '../utils/appSettingsValidation'

const returnAppSettings = async (
  _root: unknown,
  _args: unknown,
  ctx: Context
): Promise<ReturnAppSettings | null> => {
  const {
    clients: { 
      returnSettings : returnSettingsClient,
      account : accountClient,
      settingsAccount
    },
  } = ctx

  
  const accountInfo = await accountClient.getInfo()

  let appConfig: Settings = DEFAULT_SETTINGS
  if(!accountInfo?.parentAccountName){
    appConfig = await settingsAccount.getSettings(ctx)
  }
  
  const settings = await returnSettingsClient.getReturnSettingsMket({
    parentAccountName: accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig
  })

  if (!settings) return null

  return settings
}

const saveReturnAppSettings = async (
  _root: unknown,
  args: MutationSaveReturnAppSettingsArgs,
  ctx: Context
) => {
  const {
    clients: { 
      returnSettings : returnSettingsClient,
      account : accountClient,
      settingsAccount
    },
  } = ctx

  // validate if all custom reasons have max days smaller than the general max days
  validateMaxDaysCustomReasons(
    args.settings.maxDays,
    args.settings.customReturnReasons
  )

  // validate if all custom reasons have unique locales for their translations
  valideteUniqueCustomReasonsPerLocale(args.settings.customReturnReasons)
  const settings = {
    ...args.settings,
    // validate that there is at least one payment method selected or user has to use the same as in the order
    paymentOptions: validatePaymentOptions(args.settings.paymentOptions),
  }

  const accountInfo = await accountClient.getInfo()
  let appConfig: Settings = DEFAULT_SETTINGS
  if(!accountInfo?.parentAccountName){
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const parentAccountName = accountInfo?.parentAccountName || appConfig?.parentAccountName
  
  const requestSettings = {
    settings :
    {
      sellerId: accountInfo.accountName,
      parentAccount: parentAccountName,
      ...settings,
    }
  }

  const payload = {
    parentAccountName,
    settings: requestSettings,
    auth: appConfig
  }

  await returnSettingsClient.saveReturnSettings(payload)
  return true
}

export const queries = { returnAppSettings }
export const mutations = { saveReturnAppSettings }



