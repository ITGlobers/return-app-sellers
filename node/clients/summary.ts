import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { BASE_URL } from '../utils/constants'

export class Summary extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdClientAutCookie: ctx.adminUserAuthToken ?? ctx.authToken,
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public async getSummaryByOrderId(props: {
    parentAccountName: string
    orderId: string
  }): Promise<any> {
    const { parentAccountName, orderId } = props

    const URL = this.routes.getSummary(parentAccountName, orderId)
    try {
      const response = await this.http.get(URL, {
        headers: {
          VtexIdClientAutCookie: `${this.context.authToken}`,
          Accept: 'application/json',
          'X-Vtex-Use-Https': 'true',
        },
      })
      return response
    } catch (error) {
      throw new Error(
        `Getting Summary Error:  ${
          error?.response?.data?.message || error?.response?.message
        }`
      )
    }
  }

  public async getSummaryList(props: {
    parentAccountName: string
    orders: any[]
  }): Promise<any> {
    const { parentAccountName, orders } = props

    const URL = this.routes.getSummaryList(parentAccountName)
    try {
      const response = await this.http.post(URL, orders, {
        headers: {
          VtexIdClientAutCookie: `${this.context.authToken}`,
          Accept: 'application/json',
          'X-Vtex-Use-Https': 'true',
        },
      })
      return response
    } catch (error) {
      throw new Error(
        `Getting Summary Error:  ${
          error?.response?.data?.message || error?.response?.message
        }`
      )
    }
  }

  private get routes() {
    return {
      getSummary: (parentAccountName: string, orderId: string) =>
        `${BASE_URL(parentAccountName)}${parentAccountName}/${
          this.context.workspace
        }/_v/return-app/orders/${orderId}/summary`,
      getSummaryList: (parentAccountName: string) =>
        `${BASE_URL(parentAccountName)}${parentAccountName}/${
          this.context.workspace
        }/_v/return-app/orders/summary`,
    }
  }
}
