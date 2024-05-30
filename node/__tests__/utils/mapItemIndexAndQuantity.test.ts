import type { ItemPackage } from '@vtex/clients'
import { mapItemIndexAndQuantity } from '../../utils/mapItemIndexAndQuantity'

describe('mapItemIndexAndQuantity', () => {
  it('should correctly map item index to quantity', () => {
    const itemPackages: Array<
      Omit<ItemPackage, 'description' | 'price' | 'unitMultiplier'>
    > = [
      { itemIndex: 1, quantity: 2 },
      { itemIndex: 2, quantity: 3 },
      { itemIndex: 1, quantity: 4 },
      { itemIndex: 3, quantity: 1 },
    ]

    const result = mapItemIndexAndQuantity(itemPackages)
    const expected = new Map([
      [1, 6], // 2 + 4
      [2, 3],
      [3, 1],
    ])

    expect(result).toEqual(expected)
  })

  it('should return an empty map when given an empty array', () => {
    const itemPackages: Array<
      Omit<ItemPackage, 'description' | 'price' | 'unitMultiplier'>
    > = []

    const result = mapItemIndexAndQuantity(itemPackages)
    const expected = new Map()

    expect(result).toEqual(expected)
  })

  it('should correctly handle a single item package', () => {
    const itemPackages: Array<
      Omit<ItemPackage, 'description' | 'price' | 'unitMultiplier'>
    > = [{ itemIndex: 1, quantity: 5 }]

    const result = mapItemIndexAndQuantity(itemPackages)
    const expected = new Map([[1, 5]])

    expect(result).toEqual(expected)
  })

  it('should correctly handle multiple items with the same index', () => {
    const itemPackages: Array<
      Omit<ItemPackage, 'description' | 'price' | 'unitMultiplier'>
    > = [
      { itemIndex: 1, quantity: 2 },
      { itemIndex: 1, quantity: 3 },
      { itemIndex: 1, quantity: 4 },
    ]

    const result = mapItemIndexAndQuantity(itemPackages)
    const expected = new Map([[1, 9]]) // 2 + 3 + 4

    expect(result).toEqual(expected)
  })

  it('should correctly handle items with different indices', () => {
    const itemPackages: Array<
      Omit<ItemPackage, 'description' | 'price' | 'unitMultiplier'>
    > = [
      { itemIndex: 1, quantity: 2 },
      { itemIndex: 2, quantity: 3 },
      { itemIndex: 3, quantity: 4 },
    ]

    const result = mapItemIndexAndQuantity(itemPackages)
    const expected = new Map([
      [1, 2],
      [2, 3],
      [3, 4],
    ])

    expect(result).toEqual(expected)
  })
})
