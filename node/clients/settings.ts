import type { InstanceOptions, IOContext } from '@vtex/api'
import { appIdToAppAtMajor, ExternalClient } from '@vtex/api'

export interface Settings {
  parentAccountName: string
  appKey: string
  appToken: string
}

const VTEX_APP_ID = process.env.VTEX_APP_ID!
const VTEX_APP_AT_MAJOR = appIdToAppAtMajor(VTEX_APP_ID)

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

export class SettingsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getSettings(ctx: Context): Promise<any | undefined> {
    const {
      clients: { apps },
    } = ctx

    const appSettings: Settings = {
      ...DEFAULT_SETTINGS,
      ...(await apps.getAppSettings(VTEX_APP_AT_MAJOR)),
    }

    return appSettings
  }
}
