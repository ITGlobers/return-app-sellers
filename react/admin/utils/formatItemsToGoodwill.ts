import { InvoiceRequestInput } from '../../../typings/InvoiceRequest'
import { OrderSummary } from '../../../typings/Summary'
import { InvoiceState } from '../provider/OrderToInvoiceReducer'

export function formatItemsToGoodwill(
  orderToReturn: OrderSummary
): ItemToGoodwill[] {
  const { items } = orderToReturn

  return items.map((item) => {
    return {
      ...item,
      quantityAvailablePerItem: item.amountAvailablePerItem.quantity,
      amountAvailablePerItem: item.amountAvailablePerItem.amount,
      name: item.name,
      imageUrl: item.image,
      orderValue: orderToReturn.orderValue,
      shippingValue: orderToReturn.shippingValue,
      id: item.id,
      isExcluded: false,
      amount: item.unitCost,
      quantity: item.amountAvailablePerItem.quantity,
      goodwill:
        item.amountAvailablePerItem.quantity * item.unitCost -
        item.amountAvailablePerItem.amount,
    }
  })
}

export function formatInvoiceRequestInput(
  invoiceState: InvoiceState
): InvoiceRequestInput {
  return {
    type: invoiceState.type,
    description: invoiceState.description,
    issuanceDate: invoiceState.issuanceDate,
    invoiceNumber: invoiceState.invoiceNumber,
    invoiceValue: invoiceState.invoiceValue,
    invoiceKey: invoiceState.invoiceKey,
    items: invoiceState.items,
  }
}
