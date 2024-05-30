import { ResolverError, UserInputError } from '@vtex/api'
import { orderToReturnSummary } from '../../resolvers/orderToReturnSummary'
import { canOrderBeReturned } from '../../utils/canOrderBeReturned'
import { createOrdersToReturnSummary } from '../../utils/createOrdersToReturnSummary'
import { getCustomerEmail } from '../../utils/getCostumerEmail'
import { isUserAllowed } from '../../utils/isUserAllowed'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'
import { mockReturnAppSettings } from './orderSummary.test'
import { mockResponseOrder } from './ordersAvailableToReturn.test'
import { ClientProfileDetail } from '@vtex/clients'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
jest.mock('../../utils/createOrdersToReturnSummary')
jest.mock('../../utils/isUserAllowed')
jest.mock('../../utils/canOrderBeReturned')
jest.mock('../../utils/getCostumerEmail')
export const userProfile: UserProfile = {
  email: 'example',
  userId: 'example',
  role: 'admin',
}
const mockClientProfileData: ClientProfileDetail[] = [
  {
    email: 'test@example.com',
    document: '123456789',
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-1234',
    userProfileId: 'userProfileId',
  },
]
describe('orderToReturnSummary resolver', () => {
  const mockContext = {
    state: { userProfile, appkey: 'mockAppKey' },
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
      oms: {
        getOrder: jest.fn().mockResolvedValue(mockResponseOrder),
        order: jest.fn().mockResolvedValue(mockResponseOrder),
      },
      order: { getOrder: jest.fn() },
      catalog: {},
      catalogGQL: {},
      profile: {
        getProfileUnmask: jest.fn(),
        getAddressUnmask: jest.fn(),
        searchEmailByUserId: jest.fn().mockResolvedValue(mockClientProfileData),
      },
    },
    vtex: { logger: { error: jest.fn() } },
  } as unknown as Context

  const mockOrderId = 'mockOrderId'

  it('should return order to return summary successfully', async () => {
    const mockCreateOrdersToReturnSummary =
      createOrdersToReturnSummary as jest.Mock
    const mockGetCustomerEmail = getCustomerEmail as jest.Mock
    mockCreateOrdersToReturnSummary.mockResolvedValueOnce({
      someField: 'someValue',
    })
    mockGetCustomerEmail.mockReturnValue('test@example.com')

    const result = await orderToReturnSummary(
      null,
      { orderId: mockOrderId },
      mockContext
    )

    expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
    expect(
      mockContext.clients.settingsAccount.getSettings
    ).toHaveBeenCalledWith(mockContext)
    expect(mockContext.clients.returnSettings.getReturnSettingsMket)
      .toHaveBeenCalled
    expect(mockContext.clients.oms.order).toHaveBeenCalledWith(mockOrderId)
    expect(isUserAllowed).toHaveBeenCalled()
    expect(canOrderBeReturned).toHaveBeenCalled()
    expect(createOrdersToReturnSummary).toHaveBeenCalled()
    expect(result).toEqual({ someField: 'someValue' })
  })

  it('should throw ResolverError if settings are not configured', async () => {
    const mockContextWithoutSettings = {
      state: { userProfile, appkey: 'mockAppKey' },
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn(),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        profile: {
          getProfileUnmask: jest.fn(),
          getAddressUnmask: jest.fn(),
          searchEmailByUserId: jest
            .fn()
            .mockResolvedValue(mockClientProfileData),
        },
      },
      vtex: { logger: { error: jest.fn() } },
    } as unknown as Context

    await expect(
      orderToReturnSummary(
        null,
        { orderId: mockOrderId },
        mockContextWithoutSettings
      )
    ).rejects.toThrow(ResolverError)
    await expect(
      orderToReturnSummary(
        null,
        { orderId: mockOrderId },
        mockContextWithoutSettings
      )
    ).rejects.toThrow('Return App settings is not configured')
  })

  it('should throw UserInputError if orderId is missing', async () => {
    await expect(
      orderToReturnSummary(null, { orderId: '' }, mockContext)
    ).rejects.toThrow(UserInputError)
    await expect(
      orderToReturnSummary(null, { orderId: '' }, mockContext)
    ).rejects.toThrow('Order ID is missing')
  })
})
