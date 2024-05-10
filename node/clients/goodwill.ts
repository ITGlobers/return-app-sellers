import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { BASE_URL } from '../utils/constants'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Goodwill extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getGoodwillSeller(props: {
    parentAccountName: string
    auth: Auth
    sellerID: string
    id?: string
  }): Promise<any | undefined> {
    const { sellerID, id, parentAccountName } = props

    const URI = this.routes.goodwillMket(sellerID, parentAccountName, id)

    return this.http.get(URI, {
      headers: {
        Authorization: `Bearer ${this.context.authToken}`,
      },
    })
  }

  public async createGoodwillSeller(props: {
    parentAccountName: string
    goodwill: any
    auth: Auth
  }): Promise<any> {
    const { goodwill, parentAccountName } = props
    const URL = this.routes.createGoodwillMket(parentAccountName)
    const response = await this.http.post(URL, goodwill, {
      headers: {
        Authorization: `Bearer ${this.context.authToken}`,
      },
    })

    return response
  }

  public async updateGoodwillSeller(props: {
    parentAccountName: string
    goodwill: any
    auth: Auth
  }): Promise<any> {
    const { goodwill, parentAccountName } = props
    const response = await this.http.put(
      this.routes.createGoodwillMket(parentAccountName),
      goodwill,
      {
        headers: {
          Authorization: `Bearer ${this.context.authToken}`,
        },
      }
    )

    return response
  }

  private get routes() {
    return {
      goodwillMket: (
        sellerID: string,
        parentAccountName: string,
        id?: string
      ) =>
        id
          ? `${BASE_URL}${parentAccountName}/${this.context.workspace}/_v/goodwill/${id}?_sellerId=${sellerID}`
          : `${BASE_URL}${parentAccountName}/${this.context.workspace}/_v/goodwill?_sellerId=${sellerID}`,
      createGoodwillMket: (parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}/_v/goodwill`,
    }
  }
}
