import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/settings'
const baseURLMket = 'myvtex.com/_v/returns/settings'

const routes = {
  returnSettingMket: (parentAccountName: string ) => `http://${parentAccountName}.${baseURLMket}`,
  returnSettings: (parentAccountName: string ) => `http://${parentAccountName}.${baseURL}/${parentAccountName}`,
  updateSettings: (parentAccountName: string ) => `http://${parentAccountName}.${baseURL}`,
}

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}
export class ReturnSettings extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getReturnSettingsMket (props: {
    parentAccountName : string,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      auth
    } = props

    try {

      const URI = routes.returnSettingMket(parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey,
            'X-VTEX-API-AppToken': auth?.appToken
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnSettingsMket')
    }

  } 

  public async getReturnSettings (props: {
    parentAccountName : string,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      auth
    } = props

    try {

      const URI = routes.returnSettings(parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey,
            'X-VTEX-API-AppToken': auth?.appToken
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnSettings')
    }

  } 

  public async saveReturnSettings (props : {
    parentAccountName : string,
    settings:any,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      settings,
      auth
    } = props

    try {
      const response = await this.http.post(
        routes.updateSettings(parentAccountName),
        settings,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || "",
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey,
            'X-VTEX-API-AppToken': auth?.appToken
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }

  } 

}
