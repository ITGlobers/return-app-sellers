import type {
  ReturnAppSettings,
  MutationSaveReturnAppSettingsArgs,
} from 'obidev.obi-return-app-sellers'

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
      account : accountClient ,
    },
  } = ctx

  
  const accountInfo = await accountClient.getInfo()  
  const settings = await returnSettingsClient.getReturnSettings(accountInfo)
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
      account : accountClient 
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
  const requestSettings = {
    settings :
    {
      sellerId: accountInfo.accountName,
      parentAccount: accountInfo.parentAccountName ,
      ...settings,

    }

  }
  await returnSettingsClient.saveReturnSettings(accountInfo , requestSettings)
  return true
}

export const queries = { returnAppSettings }
export const mutations = { saveReturnAppSettings }



