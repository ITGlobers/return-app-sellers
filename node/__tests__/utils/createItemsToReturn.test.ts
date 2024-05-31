import { OrderItemDetailResponse, PriceTag, SellerDetail } from '@vtex/clients'
import { ReturnRequestItemInput } from '../../../typings/ReturnRequest'
import { UserInputError } from '@vtex/api'
import { CatalogGQL } from '../../clients/catalogGQL'
import {
  calculateItemTax,
  createItemsToReturn,
} from '../../utils/createItemsToReturn'
import { translateItemName } from '../../utils/translateItems'
import { Catalog } from '../../clients/catalog'

jest.mock('../../utils/translateItems')

const mockItemsToReturn: ReturnRequestItemInput[] = [
  {
    orderItemIndex: 0,
    quantity: 1,
    condition: 'unspecified',
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
  },
  {
    orderItemIndex: 1,
    quantity: 2,
    condition: 'newWithBox',
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
  },
]

const mockOrderItems: OrderItemDetailResponse[] = [
  {
    id: '1',
    sellingPrice: 100,
    tax: 10,
    priceTags: [] as PriceTag[],
    quantity: 2,
    name: 'Item 1',
    imageUrl: '',
    unitMultiplier: 1,
    seller: '1',
    refId: '1',
    productId: '1',
    uniqueId: '',
    ean: '',
    lockId: '',
    itemAttachment: [],
    attachments: [],
    price: 0,
    listPrice: 0,
    manualPrice: undefined,
    detailUrl: null,
    components: [],
    bundleItems: [],
    params: [],
    offerings: [],
    sellerSku: '',
    priceValidUntil: undefined,
    commission: 0,
    preSaleDate: undefined,
    additionalInfo: {
      brandName: '',
      brandId: '',
      categoriesIds: '',
      productClusterId: '',
      commercialConditionId: '',
      dimension: {
        cubicweight: 0,
        height: 0,
        length: 0,
        weight: 0,
        width: 0,
      },
      offeringInfo: undefined,
      offeringType: undefined,
      offeringTypeId: undefined,
    },
    measurementUnit: '',
    isGift: false,
    shippingPrice: undefined,
    rewardValue: 0,
    freightCommission: 0,
    priceDefinition: undefined,
    taxCode: '',
    productCategories: undefined,
  },
  {
    id: '2',
    sellingPrice: 200,
    tax: 20,
    priceTags: [] as PriceTag[],
    quantity: 1,
    name: 'Item 2',
    imageUrl: 'http://example.com/image2.jpg',
    unitMultiplier: 1,
    seller: '2',
    refId: '2',
    productId: '2',
    uniqueId: '',
    ean: '',
    lockId: '',
    itemAttachment: [],
    attachments: [],
    price: 0,
    listPrice: 0,
    manualPrice: undefined,
    detailUrl: null,
    components: [],
    bundleItems: [],
    params: [],
    offerings: [],
    sellerSku: '',
    priceValidUntil: undefined,
    commission: 0,
    preSaleDate: undefined,
    additionalInfo: {
      brandName: '',
      brandId: '',
      categoriesIds: '',
      productClusterId: '',
      commercialConditionId: '',
      dimension: {
        cubicweight: 0,
        height: 0,
        length: 0,
        weight: 0,
        width: 0,
      },
      offeringInfo: undefined,
      offeringType: undefined,
      offeringTypeId: undefined,
    },
    measurementUnit: '',
    isGift: false,
    shippingPrice: undefined,
    rewardValue: 0,
    freightCommission: 0,
    priceDefinition: undefined,
    taxCode: '',
    productCategories: undefined,
  },
]

const mockSellers: SellerDetail[] = [
  {
    id: '1',
    name: 'Seller 1',
    logo: '',
  },
  {
    id: '2',
    name: 'Seller 2',
    logo: '',
  },
]

const mockItemMetadata = {
  Items: [{ Id: '1', ImageUrl: 'http://example.com/image1.jpg' }],
}

const mockCatalog = {} as Catalog
const mockCatalogGQL = {} as CatalogGQL

describe('createItemsToReturn', () => {
  beforeEach(() => {
    ;(translateItemName as jest.Mock).mockResolvedValue('Localized Name')
  })

  it('should return items correctly', async () => {
    const result = await createItemsToReturn({
      itemsToReturn: mockItemsToReturn,
      orderItems: mockOrderItems,
      sellers: mockSellers,
      itemMetadata: mockItemMetadata,
      catalog: mockCatalog,
      catalogGQL: mockCatalogGQL,
      isSellerPortal: false,
    })

    expect(result).toEqual([
      {
        orderItemIndex: 0,
        quantity: 1,
        condition: 'unspecified',
        id: '1',
        sellingPrice: 100,
        tax: 10,
        name: 'Item 1',
        localizedName: 'Localized Name',
        imageUrl: '',
        unitMultiplier: 1,
        sellerId: '1',
        refId: '1',
        productId: '1',
        sellerName: 'Seller 1',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 1,
        quantity: 2,
        condition: 'newWithBox',
        id: '2',
        sellingPrice: 200,
        tax: 20,
        name: 'Item 2',
        localizedName: 'Localized Name',
        imageUrl: 'http://example.com/image2.jpg',
        unitMultiplier: 1,
        sellerId: '2',
        refId: '2',
        productId: '2',
        sellerName: 'Seller 2',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
    ])
  })

  it('should throw error if item index does not exist', async () => {
    await expect(
      createItemsToReturn({
        itemsToReturn: [
          {
            orderItemIndex: 3,
            quantity: 1,
            condition: 'unspecified',
            returnReason: {
              reason: '',
              otherReason: undefined,
            },
          },
        ],
        orderItems: mockOrderItems,
        sellers: mockSellers,
        itemMetadata: mockItemMetadata,
        catalog: mockCatalog,
        catalogGQL: mockCatalogGQL,
        isSellerPortal: false,
      })
    ).rejects.toThrow(UserInputError)
  })

  it('should handle missing image URLs', async () => {
    const result = await createItemsToReturn({
      itemsToReturn: [
        {
          orderItemIndex: 0,
          quantity: 1,
          condition: 'unspecified',
          returnReason: {
            reason: '',
            otherReason: undefined,
          },
        },
      ],
      orderItems: [mockOrderItems[0]],
      sellers: [mockSellers[0]],
      itemMetadata: { Items: [] },
      catalog: mockCatalog,
      catalogGQL: mockCatalogGQL,
      isSellerPortal: false,
    })

    expect(result[0].imageUrl).toBe('')
  })

  it('should handle missing seller names', async () => {
    const result = await createItemsToReturn({
      itemsToReturn: [
        {
          orderItemIndex: 0,
          quantity: 1,
          condition: 'unspecified',
          returnReason: {
            reason: '',
            otherReason: undefined,
          },
        },
      ],
      orderItems: [mockOrderItems[0]],
      sellers: [],
      itemMetadata: mockItemMetadata,
      catalog: mockCatalog,
      catalogGQL: mockCatalogGQL,
      isSellerPortal: false,
    })

    expect(result[0].sellerName).toBe('')
  })
})

describe('calculateItemTax', () => {
  it('should return the tax value if tax is defined', () => {
    const tax = 10
    const priceTags: PriceTag[] = []
    const quantity = 1
    const sellingPrice = 100

    const result = calculateItemTax({ tax, priceTags, quantity, sellingPrice })

    expect(result).toBe(tax)
  })

  it('should return 0 if tax is not defined and no TAXHUB priceTags are present', () => {
    const tax = 0
    const priceTags: PriceTag[] = [
      {
        name: 'SOME_OTHER_TAG',
        isPercentual: false,
        value: 5,
        rawValue: 0.05,
        identifier: undefined,
      },
    ]
    const quantity = 1
    const sellingPrice = 100

    const result = calculateItemTax({ tax, priceTags, quantity, sellingPrice })

    expect(result).toBe(0)
  })

  it('should calculate tax from TAXHUB priceTags with percentual values', () => {
    const tax = 0
    const priceTags: PriceTag[] = [
      {
        name: 'TAXHUB_1',
        isPercentual: true,
        value: 0,
        rawValue: 0.1,
        identifier: undefined,
      },
      {
        name: 'TAXHUB_2',
        isPercentual: true,
        value: 0,
        rawValue: 0.05,
        identifier: undefined,
      },
    ]
    const quantity = 2
    const sellingPrice = 100

    const result = calculateItemTax({ tax, priceTags, quantity, sellingPrice })

    expect(result).toBe(15)
  })

  it('should calculate tax from TAXHUB priceTags with fixed values', () => {
    const tax = 0
    const priceTags: PriceTag[] = [
      {
        name: 'TAXHUB_1',
        isPercentual: false,
        value: 50,
        rawValue: 0,
        identifier: undefined,
      },
      {
        name: 'TAXHUB_2',
        isPercentual: false,
        value: 30,
        rawValue: 0,
        identifier: undefined,
      },
    ]
    const quantity = 2
    const sellingPrice = 100

    const result = calculateItemTax({ tax, priceTags, quantity, sellingPrice })

    expect(result).toBe(40)
  })

  it('should handle mixed TAXHUB priceTags with both percentual and fixed values', () => {
    const tax = 0
    const priceTags: PriceTag[] = [
      {
        name: 'TAXHUB_1',
        isPercentual: true,
        value: 0,
        rawValue: 0.1,
        identifier: undefined,
      },
      {
        name: 'TAXHUB_2',
        isPercentual: false,
        value: 30,
        rawValue: 0,
        identifier: undefined,
      },
    ]
    const quantity = 2
    const sellingPrice = 100

    const result = calculateItemTax({ tax, priceTags, quantity, sellingPrice })
    expect(result).toBe(25)
  })
})
