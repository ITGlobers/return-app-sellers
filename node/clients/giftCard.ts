import { IOContext, InstanceOptions, ExternalClient, ResolverError } from '@vtex/api'
import { BASE_URL, BASE_URL_COMPLEMENT, WS } from '../utils/constants'

const baseURL = '/_v/returns/seller/giftcard'

const routes = {
  createGiftcard: (parentAccountName: string ) => `${BASE_URL}${parentAccountName}${BASE_URL_COMPLEMENT}${parentAccountName}/${WS}${baseURL}`,
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
    } = props;

    try {
      const response = await this.http.post(
        routes.createGiftcard(parentAccountName),
        requestCreate,
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
