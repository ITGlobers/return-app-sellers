import type { Dispatch, FC } from 'react'
import React, { createContext, useReducer, useState } from 'react'

import {
  orderToGoodwillReducer,
  GoodwillRequestActions,
  initialOrderToGoodwillState,
  OrderSummaryState,
} from './OrderToGoodwillReducer'

import { ErrorsValidation } from '../utils/validateNewGoodwillFields'
import { validateNewGoodwillRequestFields } from '../utils/validateNewGoodwillFields'

interface OrderToGoodwillContextInterface {
  goodwillRequest: OrderSummaryState
  inputErrors: ErrorsValidation[]
  actions: {
    updateGoodwillRequest: Dispatch<GoodwillRequestActions>
    calculateAmount: () => OrderSummaryState
    areFieldsValid: () => boolean
  }
}

export const OrderToGoodwillContext =
  createContext<OrderToGoodwillContextInterface>(
    {} as OrderToGoodwillContextInterface
  )

export const OrderToGoodwillProvider: FC = ({ children }) => {
  
  const [goodwillRequest, updateGoodwillRequest] = useReducer(
    orderToGoodwillReducer,
    initialOrderToGoodwillState
  )
  
  const [inputErrors, setInputErrors] = useState<ErrorsValidation[]>([])

  const calculateAmount = (): OrderSummaryState => {
    const shipping =  goodwillRequest.shippingCost || 0
    const itemsAmount = goodwillRequest.items.reduce((total, item) => {
      return total + item.amount;
    }, 0);
    const total  =  shipping + itemsAmount

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

  return (
    <OrderToGoodwillContext.Provider
      value={{
        goodwillRequest,
        inputErrors,
        actions: {
          updateGoodwillRequest,
          areFieldsValid,
          calculateAmount,
        },
      }}
    >
      {children}
    </OrderToGoodwillContext.Provider>
  )
}
