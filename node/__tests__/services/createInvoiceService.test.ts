import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import createInvoiceService, {
  DEFAULT_SETTINGS,
} from '../../services/invoice/createInvoiceService'
import { getErrorLog } from '../../typings/error'
const mockItems = [
  { id: '1', name: 'Item 1', quantity: 2, price: 100 },
  { id: '2', name: 'Item 2', quantity: 1, price: 200 },
]
const mockOrder = {
  orderId: '12345',
  orderValue: 400,
  shippingValue: 50,
  amountsAvailable: {
    order: 300,
    shipping: 50,
  },
  items: mockItems,
}

const args = {
  issuanceDate: '2024-05-28',
  invoiceNumber: 'INV12345',
  invoiceValue: 400,
  invoiceKey: 'INVKEY12345',
}

const mockContext = () =>
  ({
    clients: {
      invoice: { createInvoiceSeller: jest.fn() },
      oms: { getOrder: jest.fn(), createInvoice: jest.fn() },
      account: { getInfo: jest.fn() },
      settingsAccount: { getSettings: jest.fn() },
    },
    state: {
      logs: [],
    },
    status: 200,
  } as unknown as Context)

describe('createInvoiceService', () => {
  let ctx: any

  beforeEach(() => {
    ctx = mockContext()
    ctx.clients.account.getInfo.mockResolvedValue({
      accountName: 'test-account',
      parentAccountName: '',
    })
    ctx.clients.settingsAccount.getSettings.mockResolvedValue(DEFAULT_SETTINGS)
    ctx.clients.oms.getOrder.mockResolvedValue({
      packageAttachment: { packages: [] },
      value: 100000,
    })
    ctx.clients.oms.createInvoice.mockResolvedValue({ id: 'invoice-id' })
    ctx.clients.invoice.createInvoiceSeller.mockResolvedValue({
      mockOrder,
      args,
    })
  })

  it('should create invoice successfully', async () => {
    const invoiceSellerInput = {
      type: 'Input',
      description: 'Return for items',
      issuanceDate: '2024-03-04T18:25:43-05:00',
      invoiceNumber: '1004003',
      invoiceValue: 100000,
      items: [
        {
          id: '3938479',
          description: 'sonstiges - individuell',
          amount: 100000,
          quantity: 2,
        },
      ],
    }
    const orderId = '12345-01'

    const result = await createInvoiceService(ctx, invoiceSellerInput, orderId)

    expect(ctx.clients.oms.getOrder).toHaveBeenCalledWith(orderId)

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: `Service create invoice Invoice from ${orderId}`,
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify(invoiceSellerInput),
        },
      },
    ])

    expect(result).toEqual({ id: 'invoice-id' })
  })

  it('should handle order not found error', async () => {
    ctx.clients.oms.getOrder.mockRejectedValue(new Error('Order not found'))

    const invoiceSellerInput = {}
    const orderId = 'invalid-order-id'

    await expect(
      createInvoiceService(ctx, invoiceSellerInput, orderId)
    ).rejects.toThrow('Order not found')

    expect(ctx.status).toBe(404)
  })

  it('should handle invoice type error', async () => {
    const invoiceSellerInput = {}
    const orderId = '12345'

    await expect(
      createInvoiceService(ctx, invoiceSellerInput, orderId)
    ).rejects.toThrow(getErrorLog('Invoice type error', 'INV008'))

    expect(ctx.status).toBe(400)
  })

  it('should handle invoice value greater than order value error', async () => {
    const invoiceSellerInput = {
      type: 'Input',
      description: 'Return for items',
      issuanceDate: '2024-03-04T18:25:43-05:00',
      invoiceNumber: '1004003',
      invoiceValue: 10000000,
      items: [
        {
          id: '3938479',
          description: 'sonstiges - individuell',
          amount: 100000,
          quantity: 2,
        },
      ],
    }
    const orderId = '12345-01'
    await expect(
      createInvoiceService(ctx, invoiceSellerInput, orderId)
    ).rejects.toThrow(
      getErrorLog(
        'The invoice value cant be greater than order value',
        'INV010'
      )
    )

    expect(ctx.status).toBe(400)
  })

  it('should retrieve settings if parentAccountName is not available', async () => {
    ctx.clients.account.getInfo.mockResolvedValue({
      accountName: 'test-account',
      parentAccountName: '',
    })
    ctx.clients.settingsAccount.getSettings.mockResolvedValue({
      parentAccountName: 'parent-account',
      appKey: 'key',
      appToken: 'token',
    })

    const invoiceSellerInput = {
      type: 'Input',
      description: 'Return for items',
      issuanceDate: '2024-03-04T18:25:43-05:00',
      invoiceNumber: '1004003',
      invoiceValue: 100000,
      items: [
        {
          id: '3938479',
          description: 'sonstiges - individuell',
          amount: 100000,
          quantity: 2,
        },
      ],
    }
    const orderId = '12345-01'

    await createInvoiceService(ctx, invoiceSellerInput, orderId)

    expect(ctx.clients.settingsAccount.getSettings).toHaveBeenCalledWith(ctx)
  })

  it('should handle item not available to be invoiced error', async () => {
    ctx.clients.oms.getOrder.mockResolvedValue({
      packageAttachment: {
        packages: [
          {
            items: [{ id: 'item-1' }],
          },
        ],
      },
      value: 100000,
    })
    const invoiceSellerInput = {
      type: 'Input',
      items: [{ id: 'item-2' }],
    }
    const orderId = '12345-01'

    await expect(
      createInvoiceService(ctx, invoiceSellerInput, orderId)
    ).rejects.toThrow(
      getErrorLog(
        'The following items with id: item-2 are not available to be invoiced.',
        'INV009'
      )
    )

    expect(ctx.status).toBe(400)
  })
})
