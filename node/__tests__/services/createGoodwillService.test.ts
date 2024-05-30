import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import createGoodwillService from '../../services/goodwill/createGoodwillService'
import { mockAccountInfo, mockSettings } from './getGoodwillService.test'
const mockGoodwill: Goodwill = {
  orderId: 'mockOrderId' /* otras propiedades del goodwill */,
  id: '',
  sellerId: 'mockSellerId',
  status: 'draft',
  goodwillCreditId: '',
  goodwillCreditAmount: 0,
  shippingCost: 0,
  reason: '',
  items: [
    {
      description: '',
      id: '',
      amount: 0,
    },
  ],
  logs: [
    {
      detail: '',
    },
  ],
}
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
describe('createGoodwillService', () => {
  it('should create goodwill successfully', async () => {
    const mockContext = {
      clients: {
        oms: { createInvoice: jest.fn() },
        goodwill: {
          createGoodwillSeller: jest.fn().mockResolvedValue({
            invoicesData: 'mockInvoicesData',
            data: { DocumentId: 'mockDocumentId' },
          }),
          updateGoodwillSeller: jest.fn(),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      state: { logs: [] },
    } as unknown as Context

    const result = await createGoodwillService(mockContext, mockGoodwill)

    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(
      mockContext.clients.settingsAccount.getSettings
    ).toHaveBeenCalledWith(mockContext)
    expect(mockContext.clients.goodwill.createGoodwillSeller).toHaveBeenCalled
    expect(mockContext.clients.oms.createInvoice).toHaveBeenCalledWith(
      'mockOrderId',
      'mockInvoicesData'
    )
    expect(mockContext.clients.goodwill.updateGoodwillSeller).toHaveBeenCalled

    expect(result).toEqual({
      message: 'Goodwill created successfully for orderId: mockOrderId',
      goodwill: mockGoodwill,
    })

    expect(mockContext.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: `Service create invoice Goodwill from mockOrderId`,
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: '"mockInvoicesData"',
        },
      },
    ])
  })

  it('should throw error and update goodwill status if unable to create invoice', async () => {
    const mockContext = {
      clients: {
        oms: {
          createInvoice: jest
            .fn()
            .mockRejectedValue(new Error('Unable to create invoice')),
        },
        goodwill: {
          createGoodwillSeller: jest.fn().mockResolvedValue({
            invoicesData: 'mockInvoicesData',
            data: { DocumentId: 'mockDocumentId' },
          }),
          updateGoodwillSeller: jest.fn(),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      state: { logs: [] },
    } as unknown as Context

    await expect(
      createGoodwillService(mockContext, mockGoodwill)
    ).rejects.toThrowError(
      'Cant create Invoice goodwill Unable to create invoice'
    )

    expect(mockContext.clients.goodwill.updateGoodwillSeller).toHaveBeenCalled

    // Verificar que se agregó un log al estado con la información esperada
    expect(mockContext.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Service create invoice Goodwill from mockOrderId',
        payload: {
          details: 'Body of the request captured',
          stack: '"mockInvoicesData"',
        },
        severity: 3,
      },
    ])
  })
})
