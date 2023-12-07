import type { InstanceOptions, IOContext } from '@vtex/api'
import { ResolverError, ExternalClient } from '@vtex/api'
import axios from 'axios'
import { BASE_URL, WS } from '../utils/constants'

const baseURL = '/_v/return-request'

const routes = {
  returnByID: (parentAccountName: string, returnId: string) =>
    `${BASE_URL}${parentAccountName}/${WS}${baseURL}/${returnId}`,
  createReturn: (parentAccountName: string) =>
    `${BASE_URL}${parentAccountName}/${WS}${baseURL}`,
  returnList: (parentAccountName: string) =>
    `${BASE_URL}${parentAccountName}/${WS}${baseURL}`,
  export: (parentAccountName: string) =>
    `${BASE_URL}${parentAccountName}/${WS}${baseURL}/export`,
}

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
  }): Promise<any | undefined> {
    const { id, parentAccountName, param } = props

    try {
      const params = {
        _orderId: id,
        _filter: param[0],
        _sellerName: this.context.account,
      }

      const response = await this.http.get(
        routes.returnList(parentAccountName),
        {
          params,
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )

      return response
    } catch (error) {
      console.log(error)
      throw new ResolverError('Error get')
    }
  }

  public async getReturnList(props: {
    params: any
    parentAccountName: string
  }): Promise<any | undefined> {
    const { params, parentAccountName } = props

    try {
      const response = await this.http.get(
        routes.returnList(parentAccountName),
        {
          params,
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )

      return response
    } catch (error) {
      console.log(error)
      throw new ResolverError('Error getReturnList')
    }
  }

  public async getReturnById(props: {
    returnId: any
    parentAccountName: string
  }): Promise<any | undefined> {
    const { returnId, parentAccountName } = props

    try {
      const response = await this.http.get(
        routes.returnByID(parentAccountName, returnId),
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )

      return response
    } catch (error) {
      console.log(error)
      throw new ResolverError('Error getReturnById')
    }
  }

  public async updateReturn(
    props: {
      returnId: any
      updatedRequest: any
      parentAccountName: string
      auth: Auth
    },
  ): Promise<any | undefined> {
    const { returnId, updatedRequest, parentAccountName } = props

    try {
      const response = await this.http.put(
        routes.returnByID(parentAccountName, returnId),
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )

      return response
    } catch (error) {
      console.log(error.response)
      throw new ResolverError(`Error updateReturn ${error.response?.data?.error}`)
    }
  }

  public async createReturn(props: {
    createRequest: any
    parentAccountName: string
  }): Promise<any | undefined> {
    const { createRequest, parentAccountName } = props

    try {
      const response = await this.http.post(
        routes.createReturn(parentAccountName),
        createRequest,
        {
          headers: {
            Authorization: `Bearer ${this.context.authToken}` 
          },
        }
      )

      return response
    } catch (error) {
      console.log(error)
      throw new ResolverError('Error createReturn')
    }
  }

  public async exportReturn(props: {
    dateSubmitted: string
    parentAccountName: string
  }): Promise<any | undefined> {
    const { dateSubmitted, parentAccountName } = props

    try {
      const response = await axios.get(routes.export(parentAccountName), {
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
}
