import { ReturnRequestItemInput } from '../../../typings/ReturnRequest'
import { ReturnAppSettings } from '../../../typings/ReturnAppSettings'
import { Order } from '../../clients/orders'
import { Catalog } from '../../clients/catalog'
import { CatalogGQL } from '../../clients/catalogGQL'
import { canReturnAllItems } from '../../utils/canReturnAllItems'
import { mockResponseOrder } from '../resolvers/ordersAvailableToReturn.test'
import { createOrdersToReturnSummary } from '../../utils/createOrdersToReturnSummary'
import { ResolverError } from '@vtex/api'

jest.mock('../../utils/createOrdersToReturnSummary')

const mockItemsToReturn: ReturnRequestItemInput[] = [
  {
    orderItemIndex: 1,
    quantity: 2,
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
  },
  {
    orderItemIndex: 2,
    quantity: 1,
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
  },
]

const mockExcludedCategories: ReturnAppSettings['excludedCategories'] = []

const mockOrderRequestClient = {} as Order
const mockCatalog = {} as Catalog
const mockCatalogGQL = {} as CatalogGQL
const mockAccountInfo = {}

const mockSummaryResponse = {
  invoicedItems: [
    { orderItemIndex: 1, quantity: 3 },
    { orderItemIndex: 2, quantity: 1 },
  ],
  excludedItems: [],
  processedItems: [{ itemIndex: 1, quantity: 1 }],
}

describe('canReturnAllItems', () => {
  beforeEach(() => {
    ;(createOrdersToReturnSummary as jest.Mock).mockResolvedValue(
      mockSummaryResponse
    )
  })

  it('should allow all items to be returned', async () => {
    await expect(
      canReturnAllItems(mockItemsToReturn, {
        order: mockResponseOrder,
        excludedCategories: mockExcludedCategories,
        orderRequestClient: mockOrderRequestClient,
        catalog: mockCatalog,
        catalogGQL: mockCatalogGQL,
        accountInfo: mockAccountInfo,
      })
    ).rejects.toThrow(ResolverError)
  })

  it('should not allow items to be returned if they are excluded', async () => {
    ;(createOrdersToReturnSummary as jest.Mock).mockResolvedValue({
      ...mockSummaryResponse,
      excludedItems: [{ itemIndex: 1 }],
    })

    await expect(
      canReturnAllItems(mockItemsToReturn, {
        order: mockResponseOrder,
        excludedCategories: mockExcludedCategories,
        orderRequestClient: mockOrderRequestClient,
        catalog: mockCatalog,
        catalogGQL: mockCatalogGQL,
        accountInfo: mockAccountInfo,
      })
    ).rejects.toThrow(ResolverError)
  })

  it('should not allow items to be returned if the quantity exceeds available', async () => {
    await expect(
      canReturnAllItems(
        [
          {
            orderItemIndex: 1,
            quantity: 3,
            returnReason: {
              reason: '',
              otherReason: undefined,
            },
          },
          {
            orderItemIndex: 2,
            quantity: 2,
            returnReason: {
              reason: '',
              otherReason: undefined,
            },
          },
        ],
        {
          order: mockResponseOrder,
          excludedCategories: mockExcludedCategories,
          orderRequestClient: mockOrderRequestClient,
          catalog: mockCatalog,
          catalogGQL: mockCatalogGQL,
          accountInfo: mockAccountInfo,
        }
      )
    ).rejects.toThrow(ResolverError)
  })

  it('should handle no items to return', async () => {
    await expect(
      canReturnAllItems([], {
        order: mockResponseOrder,
        excludedCategories: mockExcludedCategories,
        orderRequestClient: mockOrderRequestClient,
        catalog: mockCatalog,
        catalogGQL: mockCatalogGQL,
        accountInfo: mockAccountInfo,
      })
    ).resolves.not.toThrow()
  })
})
