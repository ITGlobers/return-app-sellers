import { ItemTotal } from '@vtex/clients'
import { ReturnRequest } from '../../../typings/ReturnRequest'
import { createRefundableTotals } from '../../utils/createRefundableTotals'

const mockItemsToReturn: ReturnRequest['items'] = [
  {
    id: '1',
    quantity: 2,
    sellingPrice: 100,
    tax: 10,
    orderItemIndex: 0,
    name: '',
    imageUrl: '',
    unitMultiplier: 0,
    sellerId: '',
    productId: '',
    refId: '',
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
    condition: 'unspecified',
  },
  {
    id: '2',
    quantity: 1,
    sellingPrice: 200,
    tax: 20,
    orderItemIndex: 0,
    name: '',
    imageUrl: '',
    unitMultiplier: 0,
    sellerId: '',
    productId: '',
    refId: '',
    returnReason: {
      reason: '',
      otherReason: undefined,
    },
    condition: 'unspecified',
  },
]

const mockTotals: ItemTotal[] = [
  {
    id: 'Items',
    value: 400,
    name: '',
  },
  {
    id: 'Shipping',
    value: 50,
    name: '',
  },
  {
    id: 'Discounts',
    value: -50,
    name: '',
  },
]

describe('createRefundableTotals', () => {
  it('should calculate refundable totals correctly with proportional shipping enabled', () => {
    const result = createRefundableTotals(mockItemsToReturn, mockTotals, true)

    expect(result).toEqual([
      { id: 'items', value: 400 },
      { id: 'shipping', value: 57 },
      { id: 'tax', value: 40 },
    ])
  })

  it('should calculate refundable totals correctly with proportional shipping disabled', () => {
    const result = createRefundableTotals(mockItemsToReturn, mockTotals, false)

    expect(result).toEqual([
      { id: 'items', value: 400 },
      { id: 'shipping', value: 50 },
      { id: 'tax', value: 40 },
    ])
  })

  it('should handle case where all items are gifts (net value = 0)', () => {
    const giftTotals: ItemTotal[] = [
      {
        id: 'Items',
        value: 0,
        name: '',
      },
      {
        id: 'Shipping',
        value: 50,
        name: '',
      },
      {
        id: 'Discounts',
        value: 0,
        name: '',
      },
    ]

    const result = createRefundableTotals(mockItemsToReturn, giftTotals, true)

    expect(result).toEqual([
      { id: 'items', value: 400 },
      { id: 'shipping', value: 25 },
      { id: 'tax', value: 40 },
    ])
  })

  it('should handle missing or undefined quantities and selling prices', () => {
    const itemsWithMissingValues: ReturnRequest['items'] = [
      {
        id: '1',
        quantity: 0,
        sellingPrice: 0,
        tax: 10,
        orderItemIndex: 0,
        name: '',
        imageUrl: '',
        unitMultiplier: 0,
        sellerId: '',
        productId: '',
        refId: '',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
        condition: 'unspecified',
      },
      {
        id: '2',
        quantity: 1,
        sellingPrice: 200,
        tax: 0,
        orderItemIndex: 0,
        name: '',
        imageUrl: '',
        unitMultiplier: 0,
        sellerId: '',
        productId: '',
        refId: '',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
        condition: 'unspecified',
      },
    ]

    const result = createRefundableTotals(
      itemsWithMissingValues,
      mockTotals,
      true
    )

    expect(result).toEqual([
      { id: 'items', value: 200 },
      { id: 'shipping', value: 29 },
      { id: 'tax', value: 0 },
    ])
  })

  it('should handle no items to return', () => {
    const result = createRefundableTotals([], mockTotals, true)

    expect(result).toEqual([
      { id: 'items', value: 0 },
      { id: 'shipping', value: 0 },
      { id: 'tax', value: 0 },
    ])
  })

  it('should handle no totals provided', () => {
    const result = createRefundableTotals(mockItemsToReturn, [], true)

    expect(result).toEqual([
      { id: 'items', value: 400 },
      { id: 'shipping', value: 0 },
      { id: 'tax', value: 40 },
    ])
  })
})
