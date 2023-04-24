import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/return-request'

const routes = {
  returnByID: (parentAccountName: string , returnId: string) => `http://${parentAccountName}.${baseURL}/${returnId}`,
  createReturn: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}`,
  returnList: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}`,
}

export class Return extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async get ( id : string ,  accountInfo : any , param : [String]) : Promise<any | undefined> {
    try {
      const params = {
        _orderId : id,
        _filter: param[0] 
      }
      const response = await this.http.get(
        routes.returnList(accountInfo.parentAccountName),
        
        {
          params,
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error get')
    }

  } 

  public async getReturnList ( params : any ,  accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.get(
        routes.returnList(accountInfo.parentAccountName),
        {
          params,
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnList')
    }

  }
  
  public async getReturnById ( returnId : any , accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.get(
        routes.returnByID(accountInfo.parentAccountName , returnId),
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnById')
    }

  } 

  
  public async updateReturn ( returnId : any , updatedRequest:any ,  accountInfo : any ) : Promise<any | undefined> {
    try {
      const response = await this.http.put(
        routes.returnByID(accountInfo.parentAccountName , returnId),
        updatedRequest,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error updateReturn')
    }

  } 

  public async createReturn ( createRequest:any , accountInfo : any  ) : Promise<any | undefined> {
    try {
      const response = await this.http.post(
        routes.createReturn(accountInfo.parentAccountName ),
        createRequest,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
            'X-Vtex-Use-Https': 'true',
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error createReturn')
    }

  } 
}
