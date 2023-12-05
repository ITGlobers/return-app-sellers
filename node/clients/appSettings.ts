import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { BASE_URL, WS } from '../utils/constants'

const baseURL = '/_v/returns/seller/settings'
const baseURLMket = '/_v/returns/settings'
const routes = {
  returnSettingMket: (parentAccountName: string ) => `${BASE_URL}${parentAccountName}/${WS}${baseURLMket}`,
  returnSettings: (parentAccountName: string ) => `${BASE_URL}${parentAccountName}/${WS}${baseURL}/${parentAccountName}`,
  updateSettings: (parentAccountName: string ) => `${BASE_URL}${parentAccountName}/${WS}${baseURL}`,
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
      parentAccountName
    } = props

    try {

      const URI = routes.returnSettingMket(parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
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
    } = props

    try {

      const URI = routes.returnSettings(parentAccountName )
      const response = await this.http.get(
        URI,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
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
    } = props

    try {
      const response = await this.http.post(
        routes.updateSettings(parentAccountName),
        settings,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }

  } 

}
