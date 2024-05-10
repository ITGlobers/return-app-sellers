import { Item } from '../../../typings/GoodwillRequest'

// When adding PartialBy in a field, it's necessary to the validation in the function isReturnRequestArgs
export interface OrderSummaryState {
  orderId: string
  goodwillCreditId: string
  goodwillCreditAmount: number
  shippingCost: number | undefined
  items: Array<Item>
  reason: string | undefined
}

export const initialOrderToGoodwillState: OrderSummaryState = {
  orderId: '',
  goodwillCreditId: '',
  goodwillCreditAmount: 0,
  items: [],
  shippingCost: 0,
  reason: '',
}

const clearState = () => {
  return {
    type: 'clearState' as const,
    payload: initialOrderToGoodwillState,
  }
}

const updateGoodwillCreditId = (goodwillCreditId: string) => {
  return {
    type: 'updateGoodwillCreditId' as const,
    payload: goodwillCreditId,
  }
}
const updateItems = (items: OrderSummaryState['items']) => {
  return {
    type: 'updateItems' as const,
    payload: items,
  }
}

const updateGoodwillCreditAmount = (goodwillCreditAmount: number) => {
  return {
    type: 'updateGoodwillCreditAmount' as const,
    payload: goodwillCreditAmount,
  }
}

const updateOrderId = (orderId: string) => {
  return {
    type: 'updateOrderId' as const,
    payload: orderId,
  }
}

const updateShippingCost = (shippingCost: number) => {
  return {
    type: 'updateShippingCost' as const,
    payload: shippingCost,
  }
}

const updateDescriptionShipping = (descriptionShipping: string) => {
  return {
    type: 'updateDescriptionShipping' as const,
    payload: descriptionShipping,
  }
}

const newGoodwillRequestState = ({
  orderId,
  goodwillCreditId,
  goodwillCreditAmount,
  reason,
  items,
  shippingCost,
}: OrderSummaryState) => {
  return {
    type: 'newGoodwillRequestState' as const,
    payload: {
      orderId,
      goodwillCreditId,
      goodwillCreditAmount,
      reason,
      shippingCost,
      items,
    },
  }
}

export type GoodwillRequestActions =
  | ReturnType<typeof clearState>
  | ReturnType<typeof newGoodwillRequestState>
  | ReturnType<typeof updateItems>
  | ReturnType<typeof updateOrderId>
  | ReturnType<typeof updateGoodwillCreditId>
  | ReturnType<typeof updateGoodwillCreditAmount>
  | ReturnType<typeof updateShippingCost>
  | ReturnType<typeof updateDescriptionShipping>

export const orderToGoodwillReducer = (
  state: OrderSummaryState,
  action: GoodwillRequestActions
) => {
  switch (action.type) {
    case 'clearState': {
      return action.payload
    }

    case 'updateOrderId': {
      return {
        ...state,
        orderId: action.payload,
      }
    }
    case 'updateItems': {
      return {
        ...state,
        items: action.payload,
      }
    }

    case 'updateGoodwillCreditAmount': {
      return {
        ...state,
        goodwillCreditAmount: action.payload,
      }
    }

    case 'updateGoodwillCreditId': {
      return {
        ...state,
        goodwillCreditId: action.payload,
      }
    }

    case 'updateShippingCost': {
      return {
        ...state,
        shippingCost: action.payload,
      }
    }

    case 'updateDescriptionShipping': {
      return {
        ...state,
        reason: action.payload,
      }
    }

    case 'newGoodwillRequestState': {
      return {
        orderId: action.payload.orderId,
        goodwillCreditId: action.payload.goodwillCreditId,
        goodwillCreditAmount: action.payload.goodwillCreditAmount,
        reason: action.payload.reason,
        items: action.payload.items,
        shippingCost: action.payload.shippingCost,
      }
    }

    default: {
      return state
    }
  }
}
