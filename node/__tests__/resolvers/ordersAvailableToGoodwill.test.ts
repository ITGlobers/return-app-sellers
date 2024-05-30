import { ResolverError } from '@vtex/api'
import { ordersAvailableToGoodwill } from '../../resolvers/ordersAvailableToGoodwill'
import { mockResponseOrder } from './ordersAvailableToReturn.test'

const mockUserProfile = { email: 'test@example.com' }
jest.mock('@vtex/api', () => {
  const originalModule = jest.requireActual('@vtex/api')

  return {
    ...originalModule,
    appIdToAppAtMajor: jest.fn(),
    ExternalClient: jest.fn(() => ({
      constructor: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    })),
  }
})

describe('ordersAvailableToGoodwill', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return orders available to goodwill', async () => {
    const mockContext = {
      state: { userProfile: mockUserProfile },
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn().mockResolvedValue({}),
        },
        oms: {
          listOrdersWithParams: jest
            .fn()
            .mockResolvedValue({ list: [mockResponseOrder], paging: {} }),
          getOrderData: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        account: { getInfo: jest.fn().mockResolvedValue({}) },
        settingsAccount: { getSettings: jest.fn().mockResolvedValue({}) },
        summary: { getSummaryList: jest.fn().mockResolvedValue({}) },
      },
    } as unknown as Context
    const result = await ordersAvailableToGoodwill(
      {},
      { page: 1, filter: {} },
      mockContext
    )

    expect(
      mockContext.clients.returnSettings.getReturnSettingsMket
    ).toHaveBeenCalled()
    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(mockContext.clients.settingsAccount.getSettings).toHaveBeenCalled()
    expect(mockContext.clients.oms.getOrderData).toHaveBeenCalled()
    expect(mockContext.clients.summary.getSummaryList).toHaveBeenCalled()

    expect(result).toEqual({
      list: expect.any(Object),
      paging: expect.any(Object),
    })
  })

  it('should throw ResolverError when Return App settings is not configured', async () => {
    const mockContext = {
      state: { userProfile: mockUserProfile },
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn().mockResolvedValue(undefined),
        },
        oms: {
          listOrdersWithParams: jest
            .fn()
            .mockResolvedValue({ list: [mockResponseOrder], paging: {} }),
          getOrderData: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        account: { getInfo: jest.fn().mockResolvedValue({}) },
        settingsAccount: { getSettings: jest.fn().mockResolvedValue({}) },
        summary: { getSummaryList: jest.fn().mockResolvedValue({}) },
      },
    } as unknown as Context
    await expect(
      ordersAvailableToGoodwill({}, { page: 1, filter: {} }, mockContext)
    ).rejects.toThrow(
      new ResolverError('Return App settings is not configured')
    )
  })
})
