import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/settings'
const baseURLMket = 'myvtex.com/_v/returns/settings'

const routes = {
  returnSettingMket: (parentAccountName: string ) => `http://${parentAccountName}.${baseURLMket}`,
  returnSettings: (parentAccountName: string ) => `http://${parentAccountName}.${baseURL}/${parentAccountName}`,
  updateSettings: (parentAccountName: string ) => `http://${parentAccountName}.${baseURL}`,
}

export class ReturnSettings extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getReturnSettingsMket (accountInfo : any ) : Promise<any | undefined> {
    try {

      const URI = routes.returnSettingMket(accountInfo.parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnSettingsMket')
    }

  } 

  public async getReturnSettings (accountInfo : any ) : Promise<any | undefined> {
    try {

      const URI = routes.returnSettings(accountInfo.parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnSettings')
    }

  } 

  public async saveReturnSettings (   accountInfo : any , settings:any  ) : Promise<any | undefined> {
    try {
      const response = await this.http.post(
        routes.updateSettings(accountInfo.parentAccountName),
        settings,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }

  } 

}
