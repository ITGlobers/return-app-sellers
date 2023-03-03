import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/return-request'

const routes = {
  retunrByID: (parentAccountName: string , returnId: string) => `http://eurango--${parentAccountName}.${baseURL}/${returnId}`,
  returnList: (sellerName: string , parentAccountName: string) => `http://eurango--${parentAccountName}.${baseURL}?_sellerName=${sellerName}`,
}

export class Return extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async getReturnList ( params : any , accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.get(
        routes.returnList(accountInfo.accountName , accountInfo.parentAccountName),
        {
          params,
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      console.log(error)
    }

  } 

  public async getReturnById ( returnId : any , accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.get(
        routes.retunrByID(accountInfo.parentAccountName , returnId),
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      console.log(response)
      return response

    } catch (error) {
      console.log(error)
    }

  } 

  
  public async updateReturn ( returnId : any , updatedRequest:any ,  accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.put(
        routes.retunrByID(accountInfo.parentAccountName , returnId),
        updatedRequest,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken,
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      console.log(response)
      return response

    } catch (error) {
      console.log(error)
    }

  } 
}
