import { ReturnRequestInput } from '../../../typings/ReturnRequest'
import {
  createReturnRequestService,
  getSubmittedBy,
} from '../../services/createReturnRequestService'
import { userProfile } from '../resolvers/orderToReturnSummary.test'
import { mockAccountInfo, mockSettings } from './getGoodwillService.test'
import { mockResponseOrder } from '../resolvers/ordersAvailableToReturn.test'
import { mockReturnRequest } from '../returnRequestResponse.test'

jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))

describe('createReturnRequestService', () => {
  jest.mock('../../services/createReturnRequestService', () => ({
    createReturnRequestService: jest.fn(),
    submittedBy: jest.fn(),
  }))
  it('should throw Items with index 0 are not available to be returned', async () => {
    const mockContextWithoutSettings = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn().mockResolvedValue({
            maxDays: 30,
            excludedCategories: [],
            orderStatus: 'f_creationDate',
            enableStatusSelection: true,
          }),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: {
          getOrder: jest.fn().mockResolvedValue(mockResponseOrder),
          order: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        return: {
          get: jest.fn().mockResolvedValue({}),
          getOrdersList: jest.fn(),
          createReturn: jest.fn(),
        },
        order: {
          getOrdersList: jest.fn().mockResolvedValue({
            data: [mockReturnRequest],
            pagination: {
              total: 0,
              page: 0,
              pageSize: 0,
            },
          }),
        },
        catalog: { getSKUByID: jest.fn() },
        catalogGQL: { getSKUTranslation: jest.fn() },
      },
      state: { userProfile, appkey: 'mockAppKey' },
      vtex: { logger: { error: jest.fn() } },
    } as unknown as Context
    const mockArgs: ReturnRequestInput = {
      orderId: '123',
      marketplaceOrderId: '456',
      items: [
        {
          orderItemIndex: 0,
          quantity: 0,
          returnReason: {
            reason: '',
            otherReason: undefined,
          },
        },
      ],
      customerProfileData: {
        name: '',
        phoneNumber: '',
      },
      pickupReturnData: {
        addressId: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        addressType: 'PICKUP_POINT',
      },
      refundPaymentData: {
        refundPaymentMethod: 'bank',
      },
      userComment: '',
      locale: '',
      sellerName: '',
    }
    await expect(
      createReturnRequestService(mockContextWithoutSettings, mockArgs)
    ).rejects.toThrow(
      'Item index 0 has no return reason. Reason cannot be empty.'
    )
  })

  it('should throw an error if there are no settings', async () => {
    const mockContextWithoutSettings = {
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
        oms: {
          getOrder: jest.fn().mockResolvedValue(mockResponseOrder),
          order: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        return: {
          get: jest.fn().mockResolvedValue({}),
          getOrdersList: jest.fn(),
          createReturn: jest.fn(),
        },
        order: {
          getOrdersList: jest.fn().mockResolvedValue({
            data: [mockReturnRequest],
            pagination: {
              total: 0,
              page: 0,
              pageSize: 0,
            },
          }),
        },
      },
      state: { userProfile, appkey: 'mockAppKey' },
      vtex: { logger: { error: jest.fn() } },
    } as unknown as Context
    const mockArgs: ReturnRequestInput = {
      orderId: '123',
      marketplaceOrderId: '456',
      items: [
        {
          orderItemIndex: 0,
          quantity: 0,
          returnReason: {
            reason: '',
            otherReason: undefined,
          },
        },
      ],
      customerProfileData: {
        name: '',
        phoneNumber: '',
      },
      pickupReturnData: {
        addressId: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        addressType: 'PICKUP_POINT',
      },
      refundPaymentData: {
        refundPaymentMethod: 'bank',
      },
      userComment: '',
      locale: '',
      sellerName: '',
    }

    await expect(
      createReturnRequestService(mockContextWithoutSettings, mockArgs)
    ).rejects.toThrow('Return App settings is not configured')
  })

  it('should throw an error if orderId is missing', async () => {
    const mockArgs: ReturnRequestInput = {
      orderId: '',
      marketplaceOrderId: '456',
      items: [],
      customerProfileData: {
        name: '',
        phoneNumber: '',
      },
      pickupReturnData: {
        addressId: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        addressType: 'PICKUP_POINT',
      },
      refundPaymentData: {
        refundPaymentMethod: 'bank',
      },
      userComment: '',
      locale: '',
      sellerName: '',
    }
    const mockContextWithoutSettings = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn().mockResolvedValue({
            maxDays: 30,
            excludedCategories: [],
            orderStatus: 'f_creationDate',
            enableStatusSelection: true,
          }),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: {
          getOrder: jest.fn().mockResolvedValue(mockResponseOrder),
          order: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        return: {
          get: jest.fn().mockResolvedValue({}),
          getOrdersList: jest.fn(),
          createReturn: jest.fn(),
        },
        order: {
          getOrdersList: jest.fn().mockResolvedValue({
            data: [mockReturnRequest],
            pagination: {
              total: 0,
              page: 0,
              pageSize: 0,
            },
          }),
        },
        catalog: { getSKUByID: jest.fn() },
        catalogGQL: { getSKUTranslation: jest.fn() },
      },
      state: { userProfile, appkey: 'mockAppKey' },
      vtex: { logger: { error: jest.fn() } },
    } as unknown as Context
    await expect(
      createReturnRequestService(mockContextWithoutSettings, mockArgs)
    ).rejects.toThrow('There are no items in the request')
  })

  it('should create ReturnRequestService', async () => {
    const mockArgs: ReturnRequestInput = {
      orderId: '123',
      marketplaceOrderId: '456',
      items: [
        {
          orderItemIndex: 0,
          quantity: 0,
          returnReason: {
            reason: 'example',
            otherReason: undefined,
          },
        },
      ],
      customerProfileData: {
        name: '',
        phoneNumber: '',
      },
      pickupReturnData: {
        addressId: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        addressType: 'PICKUP_POINT',
      },
      refundPaymentData: {
        refundPaymentMethod: 'bank',
        iban: 'NL91ABNA0417164300',
        accountHolderName: 'visa',
      },
      userComment: '',
      locale: '',
      sellerName: '',
    }
    const mockContextSettings = {
      clients: {
        returnSettings: {
          getReturnSettingsMket: jest.fn().mockResolvedValue({
            maxDays: 30,
            excludedCategories: [],
            orderStatus: 'f_creationDate',
            enableStatusSelection: true,
            options: {
              enablePickupPoints: true,
            },
            paymentOptions: {
              enablePaymentMethodSelection: true,
              allowedPaymentTypes: { bank: true },
              automaticallyRefundPaymentMethod: true,
            },
          }),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
        oms: {
          getOrder: jest.fn().mockResolvedValue(mockResponseOrder),
          order: jest.fn().mockResolvedValue(mockResponseOrder),
        },
        return: {
          get: jest.fn().mockResolvedValue({ returnRequestId: '123' }),
          getOrdersList: jest.fn(),
          createReturn: jest.fn().mockResolvedValue({}),
        },
        order: {
          getOrdersList: jest.fn().mockResolvedValue({
            data: [mockReturnRequest],
            pagination: {
              total: 0,
              page: 0,
              pageSize: 0,
            },
          }),
        },
        catalog: { getSKUByID: jest.fn() },
        catalogGQL: { getSKUTranslation: jest.fn() },
      },
      state: { userProfile, appkey: 'mockAppKey' },
      vtex: { logger: { error: jest.fn() } },
    } as unknown as Context
    jest.mock('../../services/createReturnRequestService', () => ({
      canReturnAllItems: jest.fn(),
      validateReturnReason: jest.fn(),
      validatePaymentMethod: jest.fn(),
      validateCanUsedropoffPoints: jest.fn(),
      validateItemCondition: jest.fn(),
    }))

    const response = await createReturnRequestService(
      mockContextSettings,
      mockArgs
    )
    console.log(response)
  })
})

describe('getSubmittedBy', () => {
  it('should return the appkey if provided', async () => {
    const appkey = 'appkey123'

    const result = await getSubmittedBy(userProfile, appkey)

    expect(result).toBe(appkey)
  })

  it('should return the full name if no appkey is provided', async () => {
    const result = await getSubmittedBy(userProfile)

    expect(result).toBe('example')
  })

  it('should return the email if no appkey and no full name is provided', async () => {
    const result = await getSubmittedBy(userProfile)

    expect(result).toBe('example')
  })

  it('should throw an error if no appkey, name, or email is provided', async () => {
    const userProfile: UserProfile = {
      email: '',
      userId: '',
      role: 'admin',
    }

    await expect(getSubmittedBy(userProfile)).rejects.toThrow(
      'Unable to get submittedBy from context. The request is missing the userProfile info or the appkey'
    )
  })

  it('should throw an error if both userProfile and appkey are undefined', async () => {
    await expect(getSubmittedBy(undefined, undefined)).rejects.toThrow(
      'Unable to get submittedBy from context. The request is missing the userProfile info or the appkey'
    )
  })
})
