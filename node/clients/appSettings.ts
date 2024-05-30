import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, ExternalClient } from '@vtex/api'

import { BASE_URL } from '../utils/constants'
import { ReturnAppSettings } from '../../typings/ReturnAppSettings'

const baseURL = '/_v/returns/seller/settings'
const baseURLMket = '/_v/returns/settings'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}
export class ReturnSettings extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getReturnSettingsMket(props: {
    parentAccountName: string
    auth: Auth
  }): Promise<ReturnAppSettings> {
    const { parentAccountName } = props

    try {
      const URI = this.routes.returnSettingMket(parentAccountName)
      const response = await this.http.get(URI, {
        headers: {
          Authorization: `Bearer ${this.context.authToken}`,
        },
      })
      return response
    } catch (error) {
      throw new ResolverError('Error getReturnSettingsMket')
    }
  }

  public async getReturnSettings(props: {
    parentAccountName: string
    auth: Auth
  }): Promise<ReturnAppSettings> {
    const { parentAccountName } = props

    try {
      const URI = this.routes.returnSettings(parentAccountName)
      const response = await this.http.get(URI, {
        headers: {
          Authorization: `Bearer ${this.context.authToken}`,
        },
      })
      return response
    } catch (error) {
      throw new ResolverError('Error getReturnSettings')
    }
  }

  public async saveReturnSettings(props: {
    parentAccountName: string
    settings: any
    auth: Auth
  }): Promise<any> {
    const { settings, parentAccountName } = props

    try {
      const response = await this.http.post(
        this.routes.updateSettings(parentAccountName),
        settings,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }
  }

  private get routes() {
    return {
      returnSettingMket: (parentAccountName: string) =>
        `${BASE_URL(parentAccountName)}${parentAccountName}/${
          this.context.workspace
        }${baseURLMket}`,
      returnSettings: (parentAccountName: string) =>
        `${BASE_URL(parentAccountName)}${parentAccountName}/${
          this.context.workspace
        }${baseURL}/${parentAccountName}`,
      updateSettings: (parentAccountName: string) =>
        `${BASE_URL(parentAccountName)}${parentAccountName}/${
          this.context.workspace
        }${baseURL}`,
    }
  }
}
