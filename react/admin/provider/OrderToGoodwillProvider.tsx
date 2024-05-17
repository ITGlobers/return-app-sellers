import type { Dispatch, FC } from 'react'
import React, { createContext, useReducer, useState, useMemo } from 'react'
import {
  orderToGoodwillReducer,
  GoodwillRequestActions,
  initialOrderToGoodwillState,
  OrderSummaryState,
} from './OrderToGoodwillReducer'
import { ErrorsValidation, validateNewGoodwillRequestFields } from '../utils/validateNewGoodwillFields'

interface OrderToGoodwillContextInterface {
  goodwillRequest: OrderSummaryState
  inputErrors: ErrorsValidation[]
  actions: {
    updateGoodwillRequest: Dispatch<GoodwillRequestActions>
    calculateAmount: () => OrderSummaryState
    areFieldsValid: () => boolean
  }
}

export const OrderToGoodwillContext = createContext<OrderToGoodwillContextInterface>(
  {} as OrderToGoodwillContextInterface
)

export const OrderToGoodwillProvider: FC = ({ children }) => {
  const [goodwillRequest, updateGoodwillRequest] = useReducer(
    orderToGoodwillReducer,
    initialOrderToGoodwillState
  )
  
  const [inputErrors, setInputErrors] = useState<ErrorsValidation[]>([])

  const calculateAmount = (): OrderSummaryState => {
    const shipping = goodwillRequest.shippingCost || 0
    const itemsAmount = goodwillRequest.items.reduce((total, item) => {
      return total + item.amount
    }, 0)
    const total = shipping + itemsAmount
    updateGoodwillRequest({
      type: 'updateGoodwillCreditAmount',
      payload: total,
    })
    goodwillRequest.goodwillCreditAmount = total
    return goodwillRequest
  }

  const areFieldsValid = (): boolean => {
    const { errors } = validateNewGoodwillRequestFields(goodwillRequest)
    if (errors) {
      setInputErrors(errors)
      return false
    }
    setInputErrors([])
    return true
  }

  const contextValue = useMemo(() => ({
    goodwillRequest,
    inputErrors,
    actions: {
      updateGoodwillRequest,
      calculateAmount,
      areFieldsValid,
    },
  }), [goodwillRequest, inputErrors])

  return (
    <OrderToGoodwillContext.Provider value={contextValue}>
      {children}
    </OrderToGoodwillContext.Provider>
  )
}
