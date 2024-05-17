import type { Dispatch, FC } from 'react'
import React, { createContext, useReducer, useMemo } from 'react'
import {
  orderToInvoiceReducer,
  InvoiceRequestActions,
  initialInvoiceState,
  InvoiceState,
} from './OrderToInvoiceReducer'

interface OrderToInvoiceContextInterface {
  invoiceRequest: InvoiceState
  actions: {
    updateInvoiceRequest: Dispatch<InvoiceRequestActions>
    calculateAmount: (shipping: number) => InvoiceState
  }
}

export const OrderToInvoiceContext = createContext<OrderToInvoiceContextInterface>(
  {} as OrderToInvoiceContextInterface
)

export const OrderToInvoiceProvider: FC = ({ children }) => {
  const [invoiceRequest, updateInvoiceRequest] = useReducer(
    orderToInvoiceReducer,
    initialInvoiceState
  )

  const calculateAmount = (shipping: number): InvoiceState => {
    const itemsAmount = invoiceRequest.items.reduce((total, item) => {
      return total + item.amount
    }, 0)
    const total = itemsAmount + shipping
    updateInvoiceRequest({
      type: 'updateInvoiceValue',
      payload: total,
    })
    return { ...invoiceRequest, invoiceValue: total }
  }

  const contextValue = useMemo(() => ({
    invoiceRequest,
    actions: {
      updateInvoiceRequest,
      calculateAmount,
    },
  }), [invoiceRequest])

  return (
    <OrderToInvoiceContext.Provider value={contextValue}>
      {children}
    </OrderToInvoiceContext.Provider>
  )
}
