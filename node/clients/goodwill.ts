import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const routes = {
  goodwillMket: (parentAccountName: string , sellerID: string , id?:string ) => 
    id ? `http://${parentAccountName}.myvtex.com/_v/goodwill/${id}?_sellerId=${sellerID}` :
    `http://${parentAccountName}.myvtex.com/_v/goodwill?_sellerId=${sellerID}` ,
  createGoodwillMket: (parentAccountName: string ) => `http://${parentAccountName}.myvtex.com/_v/goodwill` ,
 }

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Goodwill extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getGoodwillSeller (props: {
    parentAccountName : string,
    auth: Auth
    sellerID: string, 
    id?:string
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      auth,
      sellerID,
      id
    } = props

    try {

      const URI = routes.goodwillMket(parentAccountName, sellerID , id)
      const response = await this.http.get(
        URI,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      console.log(error)
      throw new ResolverError(`Error getReturnSettingsMket  ${JSON.stringify(error?.response?.data?.message)}`)
    }

  } 

   public async createGoodwillSeller (props : {
    parentAccountName : string,
    goodwill:any,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      goodwill,
      auth
    } = props

    try {
      const response = await this.http.post(
        routes.createGoodwillMket(parentAccountName),
        goodwill,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      console.log(error)
      throw new ResolverError(`Error createGoodwillSeller ${JSON.stringify(error?.response?.data?.message)}`)
    }
  } 

}
