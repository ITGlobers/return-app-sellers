import { ResolverError, UserInputError } from '@vtex/api'
import { orderSummary } from '../../resolvers/orderSummary'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'
import { ReturnAppSettings } from '../../../typings/ReturnAppSettings'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
jest.mock('../../services/summary/getSummaryService')
export const mockReturnAppSettings: ReturnAppSettings = {
  __typename: 'ReturnAppSettings',
  id: 'mockId',
  maxDays: 30,
  enableStatusSelection: true,
  excludedCategories: ['category1', 'category2'],
  paymentOptions: {
    allowedPaymentTypes: {
      __typename: undefined,
      bank: undefined,
      card: undefined,
      giftCard: undefined,
    },
  },
  termsUrl: 'http://example.com/terms',
  customReturnReasons: [
    {
      reason: 'Defective',
      maxDays: 0,
    },
  ],
  options: {
    enableSelectItemCondition: true,
  },
  orderStatus: 'completed',
}
describe('orderSummary resolver', () => {
  const mockOrderId = 'mockOrderId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return order summary successfully', async () => {
    const mockContext = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest
            .fn()
            .mockResolvedValue(mockReturnAppSettings),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
    } as unknown as Context
    await orderSummary(null, { orderId: mockOrderId }, mockContext)

    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(
      mockContext.clients.settingsAccount.getSettings
    ).toHaveBeenCalledWith(mockContext)
    expect(mockContext.clients.returnSettings.getReturnSettingsMket)
      .toHaveBeenCalled
  })

  it('should throw ResolverError if settings are not configured', async () => {
    const mockContextWithoutSettings = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn(),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
    } as unknown as Context
    await expect(
      orderSummary(null, { orderId: mockOrderId }, mockContextWithoutSettings)
    ).rejects.toThrow(ResolverError)
    await expect(
      orderSummary(null, { orderId: mockOrderId }, mockContextWithoutSettings)
    ).rejects.toThrow('Return App settings is not configured')
  })

  it('should throw UserInputError if orderId is missing', async () => {
    const mockContext = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest
            .fn()
            .mockResolvedValue(mockReturnAppSettings),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
    } as unknown as Context
    await expect(
      orderSummary(null, { orderId: '' }, mockContext)
    ).rejects.toThrow(UserInputError)
    await expect(
      orderSummary(null, { orderId: '' }, mockContext)
    ).rejects.toThrow('Order ID is missing')
  })
})
