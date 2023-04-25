import { IOContext, InstanceOptions, ExternalClient, ResolverError } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/giftcard'

const routes = {
  createGiftcard: (parentAccountName: string ) => `http://${parentAccountName}.${baseURL}`,
}
export class GiftCard extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async createGiftCard (   accountInfo : any , requestCreate :any  ) : Promise<any | undefined> {
    try {
      const response = await this.http.post(
        routes.createGiftcard(accountInfo.parentAccountName),
        requestCreate,
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
