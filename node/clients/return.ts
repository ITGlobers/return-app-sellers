import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, ExternalClient } from '@vtex/api'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'

interface Auth {
  parentAccountName?: string
  appKey?: string
  appToken?: string
}

export class Return extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('', ctx, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
      },
    })
  }

  public async get(props: {
    id: string
    parentAccountName: string
    param: string[]
    auth: Auth
  }): Promise<any> {
    const { id, param, parentAccountName } = props

    try {
      const params = {
        _orderId: id,
        _filter: param[0],
        _sellerName: this.context.account,
      }

      const response = await this.http.get(
        this.routes.returnList(parentAccountName),
        {
          params,
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error get')
    }
  }

  public async getReturnList(props: {
    params: any
    parentAccountName: string
  }): Promise<any> {
    const { params, parentAccountName } = props

    try {
      const response = await this.http.get(
        this.routes.returnList(parentAccountName),
        {
          params,
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error getReturnList')
    }
  }

  public async getReturnById(props: {
    returnId: any
    parentAccountName: string
  }): Promise<any> {
    const { returnId, parentAccountName } = props

    try {
      const response = await this.http.get(
        this.routes.returnByID(returnId, parentAccountName),
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error getReturnById')
    }
  }

  public async updateReturn(props: {
    returnId: any
    updatedRequest: any
    parentAccountName: string
    auth: Auth
  }): Promise<any> {
    const { returnId, updatedRequest, parentAccountName } = props

    try {
      const response = await this.http.put(
        this.routes.returnByID(returnId, parentAccountName),
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError(
        `Error updateReturn ${error.response?.data?.error}`
      )
    }
  }

  public async createReturn(props: {
    createRequest: any
    parentAccountName: string
  }): Promise<any> {
    const { createRequest, parentAccountName } = props

    try {
      const response = await this.http.post(
        this.routes.createReturn(parentAccountName),
        createRequest,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}`,
          },
        }
      )

      return response
    } catch (error) {
      throw new ResolverError('Error createReturn')
    }
  }

  public async exportReturn(props: {
    dateSubmitted: string
    parentAccountName: string
  }): Promise<any> {
    const { dateSubmitted, parentAccountName } = props

    try {
      const response = await axios.get(this.routes.export(parentAccountName), {
        headers: {
          ...this.options?.headers,
        },
        params: {
          _dateSubmitted: dateSubmitted,
          _sellerName: this.context.account,
          _onlyData: true,
        },
      })

      return response
    } catch (error) {
      throw new ResolverError('Error exportReturn')
    }
  }

  private get routes() {
    const baseURL = '/_v/return-request'

    return {
      returnByID: (returnId: string, parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}${baseURL}/${returnId}`,
      createReturn: (parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}${baseURL}`,
      returnList: (parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}${baseURL}`,
      export: (parentAccountName: string) =>
        `${BASE_URL}${parentAccountName}/${this.context.workspace}${baseURL}/export`,
    }
  }
}
