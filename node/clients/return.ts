import { InstanceOptions, IOContext, ResolverError } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const baseURL = 'myvtex.com/_v/return-request'

const routes = {
  returnByID: (parentAccountName: string , returnId: string) => `http://${parentAccountName}.${baseURL}/${returnId}`,
  createReturn: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}`,
  returnList: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}`,
  export: (parentAccountName: string) => `http://${parentAccountName}.${baseURL}/export`,
}

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Return extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, options)
  }

  public async get (props: {
    id: string,
    parentAccountName: string,
    param: string[],
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      id,
      parentAccountName,
      param,
      auth
    } = props;

    try {
      const params = {
        _orderId : id,
        _filter: param[0],
        _sellerName: this.context.account
      }
      
      const response = await this.http.get(
        routes.returnList(parentAccountName),
        
        {
          params,
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '', 
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error get')
    }

  } 

  public async getReturnList (props: {
    params: any,
    parentAccountName: string,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      params,
      parentAccountName,
      auth
    } = props;

    try {
      const response = await this.http.get(
        routes.returnList(parentAccountName),
        {
          params,
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error getReturnList')
    }

  }
  
  public async getReturnById (props: {
    returnId: any,
    parentAccountName: string,
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      returnId,
      parentAccountName,
      auth
    } = props;

    try {
      const response = await this.http.get(
        routes.returnByID(parentAccountName , returnId),
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )

      return response

    } catch (error) {
      throw new ResolverError('Error getReturnById')
    }

  } 

  
  public async updateReturn (props: {
    returnId: any,
    updatedRequest: any,
    parentAccountName: string
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      returnId,
      updatedRequest,
      parentAccountName,
      auth
    } = props;

    try {
      const response = await this.http.put(
        routes.returnByID(parentAccountName , returnId),
        updatedRequest,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error updateReturn')
    }

  } 

  public async createReturn (props: {
    createRequest: any,
    parentAccountName: string
    auth: Auth
  }) : Promise<any | undefined> {
    const {
      createRequest,
      parentAccountName,
      auth
    } = props

    try {
      const response = await this.http.post(
        routes.createReturn(parentAccountName ),
        createRequest,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken  || '',
            'X-Vtex-Use-Https': 'true',
            'X-VTEX-API-AppKey': auth?.appKey || '',
            'X-VTEX-API-AppToken': auth?.appToken || ''
          }
        }
      )
      return response

    } catch (error) {
      throw new ResolverError('Error createReturn')
    }

  }
  
  public async exportReturn(props: {
    dateSubmitted: string,
    parentAccountName: string,
  }) : Promise<any | undefined> {
    const {
      dateSubmitted,
      parentAccountName,
    } = props;

    try {
      const response = await this.http.get(
        routes.export(parentAccountName),
        {
          params: {
            _dateSubmitted: dateSubmitted,
            _sellerName: this.context.account
          }
        }
      )

      return response

    } catch (error) {
      throw new ResolverError('Error exportReturn')
    }

  }

}
