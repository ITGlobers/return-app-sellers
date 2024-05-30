import { ReturnRequest } from '../../../typings/ReturnRequest'
import { ReturnRequestResponse } from '../../resolvers/ReturnRequestResponse'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'
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
describe('ReturnRequestResponse.refundStatusData', () => {
  const mockReturnRequest: ReturnRequest = {
    orderId: 'order123',
    sellerName: 'Test Seller',
    refundableAmount: 100,
    sequenceNumber: 'seq123',
    status: 'new',
    refundableAmountTotals: [
      { id: 'items', value: 50 },
      { id: 'shipping', value: 30 },
      { id: 'tax', value: 20 },
    ],
    customerProfileData: {
      userId: 'user123',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phoneNumber: '1234567890',
    },
    pickupReturnData: {
      addressId: 'addr123',
      address: '123 Main St',
      city: 'Cityville',
      state: 'Stateland',
      country: 'Countryland',
      zipCode: '12345',
      addressType: 'CUSTOMER_ADDRESS',
      returnLabel: 'label123',
    },
    refundPaymentData: {
      refundPaymentMethod: 'card',
      iban: 'DE12345678901234567890',
      accountHolderName: 'John Doe',
      automaticallyRefundPaymentMethod: true,
    },
    items: [
      {
        orderItemIndex: 1,
        id: 'item123',
        name: 'Product 1',
        localizedName: 'Localized Product 1',
        sellingPrice: 50,
        tax: 5,
        quantity: 2,
        imageUrl: 'http://example.com/image.jpg',
        unitMultiplier: 1,
        sellerId: 'seller123',
        sellerName: 'Test Seller',
        productId: 'prod123',
        refId: 'ref123',
        returnReason: {
          reason: 'Damaged',
          otherReason: null,
        },
        condition: 'newWithBox',
      },
    ],
    dateSubmitted: '2024-01-01T00:00:00Z',
    refundData: {
      invoiceNumber: 'inv123',
      invoiceValue: 100,
      refundedItemsValue: 50,
      refundedShippingValue: 30,
      giftCard: {
        id: 'gc123',
        redemptionCode: 'code123',
      },
      items: [
        {
          orderItemIndex: 1,
          id: 'item123',
          price: 50,
          quantity: 2,
          restockFee: 10,
        },
      ],
    },
    refundStatusData: [
      {
        status: 'new',
        submittedBy: 'adminUser1',
        createdAt: '2024-01-01T00:00:00Z',
        comments: [
          {
            comment: 'This is a comment',
            createdAt: '2024-01-01T00:00:00Z',
            role: 'adminUser',
            submittedBy: 'adminUser1',
            visibleForCustomer: true,
          },
        ],
      },
    ],
    cultureInfoData: {
      currencyCode: 'USD',
      locale: 'en-US',
    },
  }

  const mookReturn = {
    get: jest.fn().mockResolvedValue({
      refundStatusData: mockReturnRequest,
    }),
  }
  const mockSettingsClient = {
    get: jest.fn().mockResolvedValue({ mockSettings }),
  }
  const mockAccount = {
    getInfo: jest.fn().mockResolvedValue(mockAccountInfo),
  }

  const mockCtx = {
    clients: {
      return: mookReturn,
      account: mockAccount,
      settingsAccount: mockSettingsClient,
    },
    request: {
      header: {
        'x-vtex-product': 'store',
      },
    },
  } as unknown as Context

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and transform refundStatusData for store user', async () => {
    const result = await ReturnRequestResponse.refundStatusData(
      {
        id: '123',
        orderId: '',
        refundableAmount: 0,
        sequenceNumber: '',
        status: 'new',
        refundableAmountTotals: [],
        customerProfileData: {
          userId: '',
          name: '',
          email: '',
          phoneNumber: '',
        },
        pickupReturnData: {
          addressId: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          addressType: 'CUSTOMER_ADDRESS',
          returnLabel: undefined,
        },
        refundPaymentData: {
          refundPaymentMethod: 'card',
          iban: undefined,
          accountHolderName: undefined,
          automaticallyRefundPaymentMethod: undefined,
        },
        items: [],
        dateSubmitted: '',
        refundData: null,
        refundStatusData: [],
        cultureInfoData: {
          currencyCode: '',
          locale: '',
        },
      },
      null,
      mockCtx
    )
    expect(result).toEqual([])
  })

  it('should return existing refundStatusData if available', async () => {
    const result = await ReturnRequestResponse.refundStatusData(
      mockReturnRequest,
      null,
      mockCtx
    )
    expect(result).toEqual([
      {
        submittedBy: undefined,
        comments: [
          {
            comment: 'This is a comment',
            createdAt: '2024-01-01T00:00:00Z',
            role: 'adminUser',
            submittedBy: 'adminUser1',
            visibleForCustomer: true,
          },
        ],
        status: 'new',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ])
  })
})
