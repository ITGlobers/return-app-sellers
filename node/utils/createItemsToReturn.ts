import { UserInputError } from '@vtex/api'
import type {
  OrderItemDetailResponse,
  PriceTag,
  SellerDetail,
} from '@vtex/clients'
import {
  ReturnRequestItemInput,
  ReturnRequestItem,
} from '../../typings/ReturnRequest'

import type { Catalog } from '../clients/catalog'
import { translateItemName } from './translateItems'
import { CatalogGQL } from '../clients/catalogGQL'

interface ItemMetadata {
  Items: Array<{
    Id: string
    ImageUrl: string
  }>
}

export const calculateItemTax = ({
  tax,
  priceTags,
  quantity,
  sellingPrice,
}: {
  tax: number
  priceTags: PriceTag[]
  quantity: number
  sellingPrice: number
}): number => {
  if (tax) return tax

  const taxHubItems = priceTags.filter((priceTag) =>
    priceTag.name.includes('TAXHUB')
  )

  if (taxHubItems.length === 0) return 0

  const taxValueFromTaxHub = taxHubItems.reduce((acc, priceTag) => {
    const { isPercentual, value, rawValue } = priceTag
    // value for TAXHUB is total (not per unit).
    // When it's percentual, the rawValue is the % to be applied. Since we divide the total ammount per quantity in the return, we
    const taxValue = isPercentual ? rawValue * sellingPrice * quantity : value

    return acc + taxValue
  }, 0)

  return parseFloat((taxValueFromTaxHub / quantity).toFixed(0))
}

export const createItemsToReturn = async ({
  itemsToReturn,
  orderItems,
  sellers,
  itemMetadata,
  catalog,
  catalogGQL,
  isSellerPortal,
}: {
  itemsToReturn: ReturnRequestItemInput[]
  orderItems: OrderItemDetailResponse[]
  sellers: SellerDetail[]
  itemMetadata: ItemMetadata
  catalog: Catalog
  catalogGQL: CatalogGQL
  isSellerPortal: boolean
}): Promise<ReturnRequestItem[]> => {
  return Promise.all(
    itemsToReturn.map(async (item) => {
      const orderItem = orderItems[item.orderItemIndex]

      if (!orderItem) {
        throw new UserInputError(
          `Item index ${item.orderItemIndex} doesn't exist on order`
        )
      }

      const {
        id,
        sellingPrice,
        tax,
        priceTags,
        quantity,
        name,
        imageUrl,
        unitMultiplier,
        seller,
        refId,
        productId,
      } = orderItem

      const sellerName =
        sellers.find((sellerInfo) => sellerInfo.id === seller)?.name ?? ''

      const productImage =
        imageUrl ??
        itemMetadata.Items.find((itemMeta) => itemMeta.Id === id)?.ImageUrl ??
        ''

      return {
        ...item,
        id,
        sellingPrice,
        tax: calculateItemTax({ tax, priceTags, quantity, sellingPrice }),
        name,
        localizedName: await translateItemName(
          id,
          name,
          catalog,
          catalogGQL,
          isSellerPortal
        ),
        imageUrl: productImage,
        unitMultiplier,
        sellerId: seller,
        refId: refId ?? '',
        productId,
        sellerName,
        condition: item.condition ? item.condition : 'unspecified',
      }
    })
  )
}
