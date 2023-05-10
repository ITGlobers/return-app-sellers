import { IOContext, InstanceOptions, ExternalClient, ResolverError } from '@vtex/api'

const baseURL = 'myvtex.com/_v/returns/seller/giftcard'

const routes = {
  createGiftcard: (parentAccountName: string ) => `http://eurango--${parentAccountName}.${baseURL}`,
}

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}
export class GiftCard extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async createGiftCard (props: {
    parentAccountName: string,
    requestCreate: any,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      parentAccountName,
      requestCreate,
      auth
    } = props;

    try {
      const response = await this.http.post(
        routes.createGiftcard(parentAccountName),
        requestCreate,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || '',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }

  } 
 

}
