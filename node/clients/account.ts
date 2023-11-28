import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, JanusClient } from '@vtex/api'

const baseURL = 'api/vlm/account'

const routes = {
  getMket: () => `${baseURL}`,
}

export class Account extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public async getInfo(vtexidclientautcookie?: any): Promise<any | undefined> {
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
