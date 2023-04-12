import type { OrderToReturnValidation } from 'vtex.return-app'

export const ORDER_TO_RETURN_VALIDATON: Record<
  OrderToReturnValidation,
  OrderToReturnValidation
> = {
  OUT_OF_MAX_DAYS: 'OUT_OF_MAX_DAYS',
  ORDER_NOT_INVOICED: 'ORDER_NOT_INVOICED',
}


export type OrderStatus = {
  label: string
  value: string
}

export const ORDER_STATUS: OrderStatus[] = [
  {
    label: 'Order accepted',
    value: 'f_creationDate'
  },
  {
    label: 'Payment approved',
    value: 'f_authorizedDate'
  },
  {
    label: 'Invoiced',
    value: 'f_invoicedDate'
  }
]