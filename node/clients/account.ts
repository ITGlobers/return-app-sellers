import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, JanusClient } from '@vtex/api'

const baseURL = 'api/vlm/account'

const routes = {
  getMket: () => `${baseURL}`,
}
export interface accountInfo {
  isActive: boolean
  id: string
  name: string
  accountName: string
  lv: null
  isOperating: boolean
  defaultUrl: null
  district: null
  country: null
  complement: null
  companyName: string
  cnpj: null
  haveParentAccount: boolean
  parentAccountId: string
  parentAccountName: string
  city: null
  address: null
  logo: null
  hasLogo: boolean
  number: null
  postalCode: null
  state: null
  telephone: string
  tradingName: string
}

export class Account extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public async getInfo(vtexidclientautcookie?: string): Promise<accountInfo> {
    try {
      const response = await this.http.get(routes.getMket(), {
        headers: {
          VtexIdClientAutCookie:
            vtexidclientautcookie ??
            this.context.adminUserAuthToken ??
            this.context.authToken ??
            '',
        },
      })

      return response
    } catch (error) {
      const message = error?.response?.data?.Message ?? error.message

      throw new ResolverError(
        message ??
          'Error getInfo marketplace, please try again with another token'
      )
    }
  }
}
