import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import { createInvoiceRequest } from '../../resolvers/createInvoiceRequest'
import createInvoiceService from '../../services/invoice/createInvoiceService'

jest.mock('../../services/invoice/createInvoiceService', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('createInvoiceRequest', () => {
  let ctx: any

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = {
      state: {
        logs: [],
      },
    }
  })

  it('should add log and call createInvoiceService with correct arguments', async () => {
    const orderId = 'mockOrderId'
    const invoiceRequest = {
      type: 'Input',
      description: 'Return for items',
      issuanceDate: '2019-01-31T18:25:43-05:00',
      invoiceNumber: 'ReturnTest3',
      invoiceValue: '100',
      invoiceKey: null,
      invoiceUrl: 'link',
      courier: null,
      trackingNumber: null,
      trackingUrl: null,
      dispatchedDate: null,
      items: [
        {
          id: '1000454',
          amount: 100,
          quantity: 1,
        },
      ],
    }

    const expectedResult = {
      date: '',
      orderId: '',
      receipt: '',
    }

    ;(createInvoiceService as jest.Mock).mockResolvedValue(expectedResult)

    const result = await createInvoiceRequest(
      {},
      { orderId, invoiceRequest },
      ctx
    )

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Resolver create Invoice',
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify(invoiceRequest),
        },
      },
    ])

    expect(createInvoiceService).toHaveBeenCalledWith(
      ctx,
      invoiceRequest,
      orderId
    )

    expect(result).toEqual(expectedResult)
  })
})
