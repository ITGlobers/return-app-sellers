import { json } from 'co-body'
import { invoice } from '../../middlewares/invoice'
import createInvoiceService from '../../services/invoice/createInvoiceService'
import { ExternalLogSeverity } from '../../middlewares/errorHandler'

jest.mock('co-body', () => ({
  json: jest.fn(),
}))
jest.mock('../../services/invoice/createInvoiceService')

describe('invoice middleware', () => {
  let ctx: any
  let next: jest.Mock

  beforeEach(() => {
    ctx = {
      req: {},
      vtex: {
        route: {
          params: {
            orderId: '12345',
          },
        },
      },
      state: {
        logs: [],
      },
      set: jest.fn(),
    }

    next = jest.fn().mockResolvedValue(null)
    ;(json as jest.Mock).mockResolvedValue({
      type: 'Input',
      description: 'Return for items',
      issuanceDate: '2024-03-04T18:25:43-05:00',
      invoiceNumber: '1004003',
      invoiceValue: 100000,
      invoiceKey: '{"preRefund":true}',
      invoiceUrl: 'link',
      courier: null,
      trackingNumber: null,
      trackingUrl: null,
      dispatchedDate: null,
      items: [
        {
          id: '3938479',
          description: 'sonstiges - individuell',
          amount: 100000,
          quantity: 2,
        },
      ],
    })
    ;(createInvoiceService as jest.Mock).mockResolvedValue({
      date: '2024-03-04T18:25:43-05:00',
      orderId: '12345',
      receipt: 'receipt123',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should process the invoice and set the response', async () => {
    await invoice(ctx, next)

    expect(json).toHaveBeenCalledWith(ctx.req)
    expect(createInvoiceService).toHaveBeenCalledWith(
      ctx,
      expect.any(Object),
      '12345'
    )

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Middleware Invoice',
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify({
            type: 'Input',
            description: 'Return for items',
            issuanceDate: '2024-03-04T18:25:43-05:00',
            invoiceNumber: '1004003',
            invoiceValue: 100000,
            invoiceKey: '{"preRefund":true}',
            invoiceUrl: 'link',
            courier: null,
            trackingNumber: null,
            trackingUrl: null,
            dispatchedDate: null,
            items: [
              {
                id: '3938479',
                description: 'sonstiges - individuell',
                amount: 100000,
                quantity: 2,
              },
            ],
          }),
        },
      },
    ])

    expect(ctx.body).toEqual({
      date: '2024-03-04T18:25:43-05:00',
      orderId: '12345',
      receipt: 'receipt123',
    })

    expect(ctx.set).toHaveBeenCalledWith('Cache-Control', 'no-cache')
    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and set the response status to 500', async () => {
    const error = new Error('Something went wrong')
    ;(createInvoiceService as jest.Mock).mockRejectedValueOnce(error)

    await expect(invoice(ctx, next)).rejects.toThrow('Something went wrong')

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Middleware Invoice',
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify({
            type: 'Input',
            description: 'Return for items',
            issuanceDate: '2024-03-04T18:25:43-05:00',
            invoiceNumber: '1004003',
            invoiceValue: 100000,
            invoiceKey: '{"preRefund":true}',
            invoiceUrl: 'link',
            courier: null,
            trackingNumber: null,
            trackingUrl: null,
            dispatchedDate: null,
            items: [
              {
                id: '3938479',
                description: 'sonstiges - individuell',
                amount: 100000,
                quantity: 2,
              },
            ],
          }),
        },
      },
    ])
  })
})
