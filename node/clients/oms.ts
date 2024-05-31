import type { InstanceOptions, IOContext } from '@vtex/api'
import type { NotificationResponse } from '@vtex/clients'
import { OMS } from '@vtex/clients'
import { getErrorLog } from '../typings/error'

const baseURL = '/api/oms'

const routes = {
  order: (id: string) => `/api/orders/pvt/document/${id}`,
  orderData: (id: string) =>
    `/api/orders/pvt/document/${id}?reason=data-validation`,
  orders: `${baseURL}/pvt/orders`,
  invoice: (orderId: string) => `${baseURL}/pvt/orders/${orderId}/invoice`,
}

interface OrderList {
  list: Array<{ orderId: string; creationDate: string }>
  paging: {
    total: number
    pages: number
    currentPage: number
    perPage: number
  }
}

interface OrderListParams {
  orderBy: 'creationDate,desc'
  f_status: string
  f_creationDate?: string
  f_authorizedDate?: string
  f_invoicedDate?: string
  page: number
  per_page: number
}

export class OMSCustom extends OMS {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public getOrder = (id: string): Promise<any> =>
    this.http.get(routes.order(id), {
      headers: {
        VtexIdClientAutCookie: this.context.adminUserAuthToken || '',
      },
      metric: 'oms-order',
    })

  public getOrderData = (id: string): Promise<any> =>
    this.http.get(routes.orderData(id), {
      headers: {
        VtexIdClientAutCookie: this.context.adminUserAuthToken || '',
      },
      metric: 'oms-order',
    })

  public listOrdersWithParams(params?: OrderListParams) {
    try {
      return this.http.get<OrderList>(routes.orders, {
        headers: {
          VtexIdClientAutCookie: this.context.authToken,
        },
        metric: 'oms-list-order-with-params',
        ...(params ? { params } : {}),
      })
    } catch (error) {
      return {
        list: [{ orderId: '', creationDate: '' }],
        paging: { total: 0, pages: 0, currentPage: 0, perPage: 0 },
      }
    }
  }

  public async createInvoice(orderId: string, invoice: any) {
    try {
      const response = await this.http.post<NotificationResponse>(
        routes.invoice(orderId),
        invoice,
        {
          headers: {
            VtexIdClientAutCookie: this.context.adminUserAuthToken || '',
          },
          metric: 'oms-create-invoice',
        }
      )
      return response
    } catch (error) {
      throw new Error(
        getErrorLog(
          `Invoice error ${JSON.stringify(error.response.data.error.message)}`,
          'INV012'
        )
      )
    }
  }
}
