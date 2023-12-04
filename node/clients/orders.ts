import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { BASE_URL, BASE_URL_COMPLEMENT, WS } from '../utils/constants'

const baseURL = '/_v/returns/seller/orderList'

const routes = {
  returnList: (parentAccountName: string) => `${BASE_URL}${parentAccountName}${BASE_URL_COMPLEMENT}${parentAccountName}/${WS}${baseURL}`,
}

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}


export class Order extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getOrdersList (props: {
    body: any,
    parentAccountName: string
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      body,
      parentAccountName,
    } = props
    
    try {
      const response = await this.http.post(
        routes.returnList(parentAccountName),
        {
          ...body,
          sellerName: this.context.account
        },
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getOrdersList')
    }

  } 

}
