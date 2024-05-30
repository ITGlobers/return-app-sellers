import { OrderDetailResponse } from '@vtex/clients'
import {
  CreateOrdersToReturnSummarySetup,
  createOrdersToReturnSummary,
  validateReturnRequestSameOrder,
} from '../../utils/createOrdersToReturnSummary'
import { ResolverError } from '@vtex/api'
import { mockReturnRequest } from '../returnRequestResponse.test'

const mockOrderDetailResponse: OrderDetailResponse = {
  items: [
    {
      id: 'item1',
      productId: 'prod1',
      name: 'Product 1',
      imageUrl: 'url1',
      additionalInfo: {
        categoriesIds: '/cat1/cat2/',
        brandName: '',
        brandId: '',
        productClusterId: '',
        commercialConditionId: '',
        offeringInfo: undefined,
        offeringType: undefined,
        offeringTypeId: undefined,
        dimension: {
          cubicweight: 0,
          height: 0,
          length: 0,
          weight: 0,
          width: 0,
        },
      },
      uniqueId: '',
      ean: '',
      lockId: '',
      itemAttachment: [],
      attachments: [],
      quantity: 0,
      seller: '',
      refId: '',
      price: 0,
      listPrice: 0,
      manualPrice: undefined,
      priceTags: [],
      detailUrl: null,
      components: [],
      bundleItems: [],
      params: [],
      offerings: [],
      sellerSku: '',
      priceValidUntil: undefined,
      commission: 0,
      tax: 0,
      preSaleDate: undefined,
      measurementUnit: '',
      unitMultiplier: 0,
      sellingPrice: 0,
      isGift: false,
      shippingPrice: undefined,
      rewardValue: 0,
      freightCommission: 0,
      priceDefinition: undefined,
      taxCode: '',
      productCategories: undefined,
    },
  ],
  orderId: 'order123',
  creationDate: '2023-01-01T00:00:00Z',
  marketplaceOrderId: 'mkt-order-123',
  packageAttachment: {
    packages: [
      {
        invoiceNumber: 'invoice123',
        items: [
          {
            itemIndex: 0,
            quantity: 0,
            price: 0,
            description: '',
            unitMultiplier: 0,
          },
        ],
        courier: '',
        invoiceValue: 0,
        invoiceUrl: '',
        issuanceDate: '',
        trackingNumber: '',
        invoiceKey: undefined,
        trackingUrl: '',
        embeddedInvoice: '',
        type: '',
        cfop: undefined,
        courierStatus: {
          status: '',
          finished: false,
          data: undefined,
        },
      },
    ],
  },
  clientProfileData: {
    document: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  },
  shippingData: {
    address: {
      receiverName: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      street: '',
    },
    logisticsInfo: [],
  },
  paymentData: {
    transactions: [],
  },
  sequence: 0,
  marketplaceServicesEndpoint: '',
  sellerOrderId: '',
  origin: '',
  affiliateId: '',
  salesChannel: '',
  merchantName: '',
  status: '',
  statusDescription: '',
  value: 0,
  lastChange: '',
  orderGroup: undefined,
  totals: [],
  marketplaceItems: [],
  giftRegistryData: undefined,
  marketingData: undefined,
  ratesAndBenefitsData: undefined,
  sellers: [],
  callCenterOperatorData: undefined,
  followUpEmail: '',
  lastMessage: undefined,
  hostname: '',
  invoiceData: undefined,
  changesAttachment: undefined,
  openTextField: undefined,
  roundingError: 0,
  orderFormId: undefined,
  commercialConditionData: undefined,
  isCompleted: false,
  allowCancellation: false,
  allowEdition: false,
  isCheckedIn: false,
  authorizedDate: '',
  invoicedDate: '',
  customData: {
    customApps: [],
  },
  storePreferencesData: {
    countryCode: '',
    currencyCode: '',
    currencyFormatInfo: {
      CurrencyDecimalDigits: 0,
      CurrencyDecimalSeparator: '',
      CurrencyGroupSeparator: '',
      CurrencyGroupSize: 0,
      StartsWithCurrencySymbol: false,
    },
    currencyLocale: 0,
    currencySymbol: '',
    timeZone: '',
  },
  marketplace: {
    baseURL: '',
    isCertified: false,
    name: '',
  },
}

jest.mock('../../utils/getInvoicedItems', () => ({
  getInvoicedItems: jest.fn().mockResolvedValue([
    {
      itemIndex: 0,
      quantity: 1,
      price: 1,
      description: '',
      unitMultiplier: 0,
    },
  ]),
}))
jest.mock('../../utils/mapItemIndexAndQuantity', () => ({
  mapItemIndexAndQuantity: jest.fn().mockImplementation((items) => {
    const map = new Map()
    if (Array.isArray(items)) {
      items.forEach((item: { index: any; quantity: any }) =>
        map.set(item.index, item.quantity)
      )
    }
    return map
  }),
}))
jest.mock('../../utils/transformOrderClientProfileData', () => ({
  transformOrderClientProfileData: jest.fn().mockResolvedValue({}),
}))
jest.mock('../../utils/transformShippingData', () => ({
  transformShippingData: jest.fn().mockResolvedValue({}),
}))
jest.mock('../../utils/canRefundCard', () => ({
  canRefundCard: jest.fn().mockResolvedValue(true),
}))
jest.mock('../../utils/translateItems', () => ({
  handleTranlateItems: jest.fn().mockResolvedValue([
    {
      id: 'item1',
      productId: 'prod1',
      quantity: 2,
      name: 'Product 1',
      imageUrl: 'url1',
      orderItemIndex: 0,
    },
  ]),
}))

describe('createOrdersToReturnSummary', () => {
  const mockEmail = 'test@example.com'
  const mockAccountInfo = {
    accountName: 'test-account',
    parentAccountName: 'parent-account',
    isSellerPortal: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a return order summary', async () => {
    const mockContext = {
      clients: {
        oms: {
          order: jest.fn(),
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
        returnSettings: {
          getReturnSettingsMket: jest.fn(),
        },
        account: {
          getInfo: jest.fn(),
        },
        catalog: {},
        catalogGQL: {},
        settingsAccount: {
          getSettings: jest.fn(),
        },
      },
    } as unknown as Context
    const mockCreateOrdersToReturnSummarySetup: CreateOrdersToReturnSummarySetup =
      {
        excludedCategories: [],
        orderRequestClient: mockContext.clients.order,
        catalog: mockContext.clients.catalog,
        catalogGQL: mockContext.clients.catalogGQL,
      }

    expect(
      await createOrdersToReturnSummary(
        mockOrderDetailResponse,
        mockEmail,
        mockAccountInfo,
        mockCreateOrdersToReturnSummarySetup
      )
    ).toReturn
  })

  it('should handle errors in validateReturnRequestSameOrder', async () => {
    const mockContext = {
      clients: {
        oms: {
          order: jest.fn(),
        },
        return: {
          get: jest.fn().mockResolvedValue({}),
          getOrdersList: jest.fn(),
          createReturn: jest.fn(),
        },
        order: {
          getOrdersList: jest
            .fn()
            .mockResolvedValue(new ResolverError('Test Error')),
        },
        returnSettings: {
          getReturnSettingsMket: jest.fn(),
        },
        account: {
          getInfo: jest.fn(),
        },
        catalog: {},
        catalogGQL: {},
        settingsAccount: {
          getSettings: jest.fn(),
        },
      },
    } as unknown as Context
    const mockCreateOrdersToReturnSummarySetup: CreateOrdersToReturnSummarySetup =
      {
        excludedCategories: [],
        orderRequestClient: mockContext.clients.order,
        catalog: mockContext.clients.catalog,
        catalogGQL: mockContext.clients.catalogGQL,
      }
    expect(
      await createOrdersToReturnSummary(
        mockOrderDetailResponse,
        mockEmail,
        mockAccountInfo,
        mockCreateOrdersToReturnSummarySetup
      )
    ).toReturn
  })
})

describe('validateReturnRequestSameOrder', () => {
  it('should handle return requests with refund data and items', async () => {
    const returnRequestSameOrder = {
      data: [
        {
          refundData: { invoiceNumber: 'invoice123' },
          items: [{ orderItemIndex: 0, quantity: 2 }],
        },
      ],
    }

    const invoicesCreatedByReturnApp: string[] = []
    const committedItemsToReturn: Array<{
      itemIndex: number
      quantity: number
    }> = []

    await validateReturnRequestSameOrder(
      returnRequestSameOrder,
      invoicesCreatedByReturnApp,
      committedItemsToReturn
    )

    expect(invoicesCreatedByReturnApp).toEqual(['invoice123'])
    expect(committedItemsToReturn).toEqual([{ itemIndex: 0, quantity: 2 }])
  })

  it('should handle return requests without refund data or items', async () => {
    const returnRequestSameOrder = {
      data: [{}],
    }

    const invoicesCreatedByReturnApp: string[] = []
    const committedItemsToReturn: Array<{
      itemIndex: number
      quantity: number
    }> = []

    await validateReturnRequestSameOrder(
      returnRequestSameOrder,
      invoicesCreatedByReturnApp,
      committedItemsToReturn
    )

    expect(invoicesCreatedByReturnApp).toEqual([])
    expect(committedItemsToReturn).toEqual([])
  })

  it('should throw a ResolverError if an error occurs', async () => {
    const invoicesCreatedByReturnApp: string[] = []
    const committedItemsToReturn: Array<{
      itemIndex: number
      quantity: number
    }> = []

    jest.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      validateReturnRequestSameOrder(
        null,
        invoicesCreatedByReturnApp,
        committedItemsToReturn
      )
    ).rejects.toThrowError(ResolverError)
  })
})
