import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, ExternalClient } from '@vtex/api'
import { BASE_URL } from '../utils/constants'

const baseURL = '/_v/returns/seller/orderList'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Order extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getOrdersList(props: {
    body: any
    parentAccountName: string
    auth: Auth
  }): Promise<any | undefined> {
    const { body , parentAccountName } = props

    try {
      const response = await this.http.post(
        this.routes.returnList(parentAccountName),
        {
          ...body,
          sellerName: this.context.account,
        },
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error getOrdersList')
    }
  }

  private get routes() {
    return {
      returnList: (parentAccountName:string) =>
        `${BASE_URL}${ parentAccountName }/${
          this.context.workspace
        }${baseURL}`,
    }
  }
}
