import getSummaryService from '../../services/summary/getSummaryService'
import { mockSettings, mockAccountInfo } from './getGoodwillService.test'
import { mockResponseOrder } from '../resolvers/ordersAvailableToReturn.test'

jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
const mockSummaryResponse = { someField: 'someValue' }
const mockOrderResponse = mockResponseOrder
describe('getSummaryService', () => {
  it('should return summary with order creation date', async () => {
    const mockContext = {
      clients: {
        summary: {
          getSummaryByOrderId: jest
            .fn()
            .mockResolvedValue({ mockSummaryResponse }),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: { getOrder: jest.fn().mockResolvedValue(mockOrderResponse) },
      },
    } as unknown as Context

    const mockOrderId = 'mockOrderId'

    const result = await getSummaryService(mockContext, mockOrderId)

    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(
      mockContext.clients.settingsAccount.getSettings
    ).toHaveBeenCalledWith(mockContext)
    expect(mockContext.clients.summary.getSummaryByOrderId).toHaveBeenCalled
    expect(mockContext.clients.oms.getOrder).toHaveBeenCalled

    expect(result).toEqual({
      creationDate: '2024-05-24T07:35:31.5183386+00:00',
      mockSummaryResponse: {
        someField: 'someValue',
      },
    })
  })

  it('should use default settings if parentAccountName is missing', async () => {
    const mockContext = {
      clients: {
        summary: {
          getSummaryByOrderId: jest
            .fn()
            .mockResolvedValue({ mockSummaryResponse }),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: { getOrder: jest.fn().mockResolvedValue(mockOrderResponse) },
      },
    } as unknown as Context

    const mockOrderId = 'mockOrderId'

    const result = await getSummaryService(mockContext, mockOrderId)

    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(
      mockContext.clients.settingsAccount.getSettings
    ).toHaveBeenCalledWith(mockContext)
    expect(mockContext.clients.summary.getSummaryByOrderId).toHaveBeenCalled
    expect(mockContext.clients.oms.getOrder).toHaveBeenCalledWith(mockOrderId)

    expect(result).toEqual({
      creationDate: '2024-05-24T07:35:31.5183386+00:00',
      mockSummaryResponse: {
        someField: 'someValue',
      },
    })
  })

  it('should throw an error if summary or order cannot be retrieved', async () => {
    const mockContext = {
      clients: {
        summary: {
          getSummaryByOrderId: jest
            .fn()
            .mockResolvedValue(new Error('Summary not found')),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: { getOrder: jest.fn().mockResolvedValue(mockOrderResponse) },
      },
    } as unknown as Context

    const mockOrderId = 'mockOrderId'

    const response = await getSummaryService(mockContext, mockOrderId)
    await expect(response).toEqual({
      creationDate: '2024-05-24T07:35:31.5183386+00:00',
    })
  })
  it('should throw an error if summary or order cannot be retrieved', async () => {
    const mockContext = {
      clients: {
        summary: {
          getSummaryByOrderId: jest.fn().mockResolvedValue({}),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: {
          getOrder: jest.fn().mockResolvedValue(new Error('Order not found')),
        },
      },
    } as unknown as Context

    const mockOrderId = 'mockOrderId'

    const response = await getSummaryService(mockContext, mockOrderId)
    await expect(response).toEqual({})
  })
})
