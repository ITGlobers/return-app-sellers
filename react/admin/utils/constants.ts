import { OrderToReturnValidation } from '../../../typings/OrdertoReturn'

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
    value: 'f_creationDate',
  },
  {
    label: 'Payment approved',
    value: 'f_authorizedDate',
  },
  {
    label: 'Invoiced',
    value: 'f_invoicedDate',
  },
]

export function getCurrency(value: any) {
  if (isNaN(value)) {
    const newValue = 0
    return newValue.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    })
  }
  const newValue = value / 100
  return newValue.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  })
}
