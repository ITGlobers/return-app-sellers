import type { IOContext, InstanceOptions } from '@vtex/api'
import { ExternalClient, ResolverError } from '@vtex/api'
import { BASE_URL } from '../utils/constants'

const baseURL = '/_v/returns/seller/giftcard'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}
export class GiftCard extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async createGiftCard(props: {
    parentAccountName: string
    requestCreate: any
    auth: Auth
  }): Promise<any | undefined> {
    const { requestCreate, parentAccountName } = props

    try {
      const response = await this.http.post(
        this.routes.createGiftcard(parentAccountName),
        requestCreate,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error saveReturnSettings')
    }
  }

  private get routes() {
    return {
      createGiftcard: (parentAccountName: string) =>
        `${BASE_URL}${ parentAccountName }/${
          this.context.workspace
        }${baseURL}`,
    }
  }
}
