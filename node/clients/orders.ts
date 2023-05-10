import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/orders'

const routes = {
  returnList: (parentAccountName: string) => `http://eurango--${parentAccountName}.${baseURL}`,
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
      auth
    } = props

    try {
      const response = await this.http.post(
        routes.returnList(parentAccountName),
        body,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || '',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getSameOrder')
    }

  } 

}
