import type { OrderDetailResponse } from '@vtex/clients'
import type {
  ReturnRequestItemInput,
  ReturnAppSettings,
} from 'vtexromania.obi-return-app-sellers'
import { ResolverError } from '@vtex/api'

import { createOrdersToReturnSummary } from './createOrdersToReturnSummary'
import type { CatalogGQL } from '../clients/catalogGQL'
import type { Return } from '../clients/return'
import type { Account } from '../clients/account'

interface CanReturnAllItemsSetup {
  order: OrderDetailResponse
  excludedCategories: ReturnAppSettings['excludedCategories']
  returnRequestClient: Return
  catalogGQL: CatalogGQL
  accountClient : Account

}

export const canReturnAllItems = async (
  itemsToReturn: ReturnRequestItemInput[],
  {
    order,
    excludedCategories,
    returnRequestClient,
    catalogGQL,
    accountClient
  }: CanReturnAllItemsSetup
) => {
  // we pass email as email because we won't use the email form the return object here
  const { invoicedItems, excludedItems, processedItems } =
    await createOrdersToReturnSummary(order, 'email', {
      excludedCategories,
      returnRequestClient,
      catalogGQL,
      accountClient
    })

  const excludedItemsIndexMap = new Map<number, boolean>()

  for (const excludedItem of excludedItems) {
    excludedItemsIndexMap.set(excludedItem.itemIndex, true)
  }

  const processedItemsQuantityIndexMap = new Map<number, number>()

  for (const processedItem of processedItems) {
    processedItemsQuantityIndexMap.set(
      processedItem.itemIndex,
      processedItem.quantity
    )
  }

  const itemAvailableMap = new Map<number, number>()

  for (let i = 0; i < invoicedItems.length; i++) {
    const { orderItemIndex, quantity } = invoicedItems[i]
    const isExcluded = excludedItemsIndexMap.get(i) ?? false
    const quantityAvailable = isExcluded
      ? 0
      : quantity - (processedItemsQuantityIndexMap.get(i) ?? 0)

    itemAvailableMap.set(orderItemIndex, quantityAvailable)
  }

  const cannotReturn = []

  for (const itemToReturn of itemsToReturn) {
    const { quantity, orderItemIndex } = itemToReturn
    const availableToReturn = itemAvailableMap.get(orderItemIndex)

    // if quantity available to return is undefined or zero or less than the quantity requested, throw error
    if (!availableToReturn || availableToReturn < quantity) {
      cannotReturn.push(orderItemIndex)
    }
  }

  if (cannotReturn.length > 0) {
    throw new ResolverError(
      `Items with index ${cannotReturn.join(
        ', '
      )} are not available to be returned`,
      400
    )
  }
}
