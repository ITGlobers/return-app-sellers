import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/orders'

const routes = {
  returnList: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}`,
}

export class Order extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getOrdersList ( body : any ,  accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.post(
        routes.returnList(accountInfo.parentAccountName),
        body,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getSameOrder')
    }

  } 

}
