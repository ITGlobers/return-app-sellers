import { InvoicedItem } from '../../../typings/OrdertoReturn'
import {
  translateItemName,
  handleTranlateItems,
} from '../../utils/translateItems'
jest.mock('../../clients/catalog', () => ({
  getSKUByID: jest.fn(),
}))

jest.mock('../../clients/catalogGQL', () => ({
  getSKUTranslation: jest.fn(),
}))

const mockCtx = {
  state: { userProfile: { email: 'test@example.com' } },
  clients: {
    catalog: {},
    catalogGQL: {
      getSKUTranslation: jest.fn().mockResolvedValue({}),
    },
  },
} as unknown as Context

describe('translateItemName', () => {
  it('returns the localized name if it is different from the original name', async () => {
    mockCtx.clients.catalogGQL.getSKUTranslation = jest
      .fn()
      .mockResolvedValue('Localized Name')
    const result = await translateItemName(
      '1',
      'Original Name',
      mockCtx.clients.catalog,
      mockCtx.clients.catalogGQL,
      false
    )

    expect(result).toBe('Localized Name')
  })

  it('returns null if the localized name is the same as the original name', async () => {
    mockCtx.clients.catalogGQL.getSKUTranslation = jest
      .fn()
      .mockResolvedValue(null)
    const result = await translateItemName(
      '1',
      '',
      mockCtx.clients.catalog,
      mockCtx.clients.catalogGQL,
      false
    )

    expect(result).toBeNull()
  })

  it('throws an error if an error occurs during translation', async () => {
    mockCtx.clients.catalogGQL.getSKUTranslation = jest
      .fn()
      .mockRejectedValue(new Error('Translation error'))

    await expect(
      translateItemName(
        '1',
        'Original Name',
        mockCtx.clients.catalog,
        mockCtx.clients.catalogGQL,
        false
      )
    ).rejects.toThrow('Error translating item name')
  })
})

describe('handleTranlateItems', () => {
  it('returns an array of invoiced items with localized names', async () => {
    const invoicedItems: InvoicedItem[] = [
      {
        id: '1',
        name: 'Original Name 1',
        productId: '',
        quantity: 0,
        imageUrl: '',
        orderItemIndex: 0,
      },
      {
        id: '2',
        name: 'Original Name 2',
        productId: '',
        quantity: 0,
        imageUrl: '',
        orderItemIndex: 0,
      },
    ]
    mockCtx.clients.catalogGQL.getSKUTranslation = jest
      .fn()
      .mockResolvedValue('Localized Name')
    const result = await handleTranlateItems(
      invoicedItems,
      mockCtx.clients.catalog,
      mockCtx.clients.catalogGQL,
      false
    )

    expect(result).toEqual([
      {
        id: '1',
        imageUrl: '',
        localizedName: 'Localized Name',
        name: 'Original Name 1',
        orderItemIndex: 0,
        productId: '',
        quantity: 0,
      },
      {
        id: '2',
        imageUrl: '',
        localizedName: 'Localized Name',
        name: 'Original Name 2',
        orderItemIndex: 0,
        productId: '',
        quantity: 0,
      },
    ])
  })
})
