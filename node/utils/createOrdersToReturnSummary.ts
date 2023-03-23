import type { OrderDetailResponse } from '@vtex/clients'
import type {
  OrderToReturnSummary,
  InvoicedItem,
  ExcludedItem,
  ProcessedItem,
  ReturnAppSettings,
  ReturnRequest,
} from 'obidev.obi-return-app-sellers'

import { getInvoicedItems } from './getInvoicedItems'
import { mapItemIndexAndQuantity } from './mapItemIndexAndQuantity'
import { transformOrderClientProfileData } from './transformOrderClientProfileData'
import { transformShippingData } from './transformShippingData'
import { canRefundCard } from './canRefundCard'
import type { CatalogGQL } from '../clients/catalogGQL'
import type { Return } from '../clients/return'
import type { Account } from '../clients/account'
import { handleTranlateItems } from './translateItems'
import { ResolverError } from '@vtex/api'

interface CreateOrdersToReturnSummarySetup {
  excludedCategories: ReturnAppSettings['excludedCategories']
  returnRequestClient: Return
  catalogGQL: CatalogGQL
  accountClient : Account
}

export const createOrdersToReturnSummary = async (
  order: OrderDetailResponse,
  email: string,
  {
    excludedCategories,
    returnRequestClient,
    catalogGQL,
    accountClient
  }: CreateOrdersToReturnSummarySetup
): Promise<OrderToReturnSummary> => {
  const { items, orderId, creationDate , marketplaceOrderId} = order
  const accountInfo = await accountClient.getInfo()  

  const params = {
    _page: 1,
    _pageSize: 10,
    _perPage:  10,
    _orderId: marketplaceOrderId,
    _sellerName: accountInfo.accountName
  }
  
  const returnRequestSameOrder = await returnRequestClient.getReturnList(params , accountInfo)
  const invoicesCreatedByReturnApp: string[] = []
  const committedItemsToReturn: Array<{ itemIndex: number; quantity: number }> =
    []
  try {
      for (const returnRequest of returnRequestSameOrder.list) {
      const { refundData, items: rmaItems } =
        (returnRequest as Pick<
          ReturnRequest,
          'items' | 'refundData' | 'refundPaymentData'
        >) ?? {}

      const { invoiceNumber } = refundData ?? {}

      /**
       * Colect all invoices created by the return app.
       * The app creates invoices type Input on object only when refunding a card.
       * It's necessary to remove all the invoices from OMS Order object to avoid considering the items twice.
       */
      // Use
      if (invoiceNumber) {
        invoicesCreatedByReturnApp.push(invoiceNumber)
      }

      for (const item of rmaItems ?? []) {
        const { orderItemIndex, quantity } = item

        if (orderItemIndex === undefined || quantity === undefined) continue

        const committedItem = {
          itemIndex: orderItemIndex,
          quantity,
        }

        committedItemsToReturn.push(committedItem)
      }
    }
  } catch (error) 
  {
    throw new ResolverError('Error createOrdersToReturnSummary')
  }
  

  // get all items (based on index on order.items) that were invoiced and sent to customer.
  // By the documentation: The Output type should be used when the invoice you are sending is a selling invoice
  // https://developers.vtex.com/vtex-rest-api/reference/invoicenotification
  const outputInvoicedItems = getInvoicedItems(
    order.packageAttachment.packages,
    'Output'
  )

  // Keep only the invoices created outside the return app. Otherwise, an item could be cosidered twice.
  const invoicedOutsideRMAApp = order.packageAttachment.packages.filter(
    ({ invoiceNumber }) => {
      return !invoicesCreatedByReturnApp.includes(invoiceNumber)
    }
  )

  // get all items (based on index on order.items) that were send a return invoice.
  // By the documentation: The Input type should be used when you send a return invoice.
  // https://developers.vtex.com/vtex-rest-api/reference/invoicenotification
  const inputIvoicedItems = getInvoicedItems(invoicedOutsideRMAApp, 'Input')

  // Create a map to get quantity invoiced with Output type for an item (based on its index)
  const quantityInvoiced = mapItemIndexAndQuantity(outputInvoicedItems)

  // Create a map to get quantity invoiced with Input type for an item (based on its index)
  const returnedQuantityInvoiced = mapItemIndexAndQuantity(inputIvoicedItems)

  // Create a map to get quantity committed (added in other RMA) for an item (based on its index)
  const committedQuantityMap = mapItemIndexAndQuantity(committedItemsToReturn)

  const invoicedItems: InvoicedItem[] = []
  const excludedItems: ExcludedItem[] = []
  const processedItems: ProcessedItem[] = []

  // Associate itemIndex with the correspondent item in the order.item
  for (const [index, quantity] of quantityInvoiced.entries()) {
    const {
      id,
      productId,
      name,
      imageUrl,
      additionalInfo: { categoriesIds },
    } = items[index]

    // Here we can add the fields we want to have in the final item array. TBD the needed ones
    const currentLength = invoicedItems.push({
      id,
      productId,
      quantity,
      name,
      imageUrl,
      orderItemIndex: index,
    })

    const categoryIdList = categoriesIds.split('/').filter(Boolean)
    const excludedCategory = excludedCategories.filter((categoryId: string) =>
      categoryIdList.includes(categoryId)
    )

    // If item is in a category that is forbidden to be returned by admin, add it to the control array
    if (excludedCategory.length) {
      excludedItems.push({
        itemIndex: currentLength - 1,
        reason: {
          key: 'EXCLUDED_CATEGORY',
          value: JSON.stringify(excludedCategory),
        },
      })
    }

    // A item could have been refunded via RMA (committedQuantity) app or OMS interface or manually via API order/{orderId}/invoice (returnedQuantity)
    const returnedQuantity = returnedQuantityInvoiced.get(index) ?? 0
    const committedQuantity = committedQuantityMap.get(index) ?? 0

    const processedQuantity = returnedQuantity + committedQuantity

    if (processedQuantity) {
      processedItems.push({
        itemIndex: currentLength - 1,
        quantity: processedQuantity,
      })
    }
  }

  return {
    orderId,
    creationDate,
    invoicedItems: await handleTranlateItems(invoicedItems, catalogGQL),
    processedItems,
    excludedItems,
    clientProfileData: transformOrderClientProfileData(
      order.clientProfileData,
      email
    ),
    shippingData: transformShippingData(order.shippingData),
    paymentData: {
      canRefundCard: canRefundCard(order.paymentData.transactions),
    },
  }
}
