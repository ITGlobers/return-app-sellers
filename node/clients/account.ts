import type {
  InstanceOptions,
  IOContext,
} from '@vtex/api'
import { JanusClient } from '@vtex/api'

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

  public async getInfo(
  ): Promise<any | undefined> {

    try {
      const response = await this.http.get(
        routes.getMket(),
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || "",
          }
        })
      return response
    } catch (error) {
      console.log(error)
    }
  }
}
