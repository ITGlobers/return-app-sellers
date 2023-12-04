import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { BASE_URL, BASE_URL_COMPLEMENT, WS } from '../utils/constants'

const routes = {
  goodwillMket: (parentAccountName: string , sellerID: string , id?:string ) => 
    id ? `${BASE_URL}${parentAccountName}${BASE_URL_COMPLEMENT}${parentAccountName}/${WS}/_v/goodwill/${id}?_sellerId=${sellerID}` :
    `${BASE_URL}${parentAccountName}${BASE_URL_COMPLEMENT}${parentAccountName}/${WS}/_v/goodwill?_sellerId=${sellerID}` ,
  createGoodwillMket: (parentAccountName: string ) => `${BASE_URL}${parentAccountName}${BASE_URL_COMPLEMENT}${parentAccountName}/${WS}/_v/goodwill` ,
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
      sellerID,
      id
    } = props

    try {

      const URI = routes.goodwillMket(parentAccountName, sellerID , id)
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
    } = props

    try {
      const response = await this.http.post(
        routes.createGoodwillMket(parentAccountName),
        goodwill,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )
      return response

    } catch (error) {
      console.log(error)
      throw new ResolverError(`Error createGoodwillSeller ${JSON.stringify(error?.response?.data?.message)}`)
    }
  } 

}
