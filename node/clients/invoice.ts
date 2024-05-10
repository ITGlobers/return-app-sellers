import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { BASE_URL } from '../utils/constants'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Invoice extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async createInvoiceSeller(props: {
    parentAccountName: string
    invoice: any
    auth: Auth
    orderId: string
  }): Promise<any> {
    const { invoice, orderId, parentAccountName } = props
    const URL = this.routes.createInvoice(orderId, parentAccountName)
    const response = await this.http.post(URL, invoice, {
      headers: {
        VtexIdClientAutCookie: `Bearer ${this.context.authToken}`,
        Accept: 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })

    return response
  }

  public async updateInvoiceSellerSummary(props: {
    parentAccountName: string
    invoice: any
    auth: Auth
    orderId: string
  }): Promise<any> {
    const { invoice, orderId, parentAccountName } = props
    const URL = this.routes.createInvoice(orderId, parentAccountName)

    const response = await this.http.put(URL, invoice, {
      headers: {
        VtexIdClientAutCookie: `Bearer ${this.context.authToken}`,
        Accept: 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })

    return response
  }

  private get routes() {
    return {
      createInvoice: (orderId: string, parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}/_v/return-app/invoice/${orderId}`,
    }
  }
}
