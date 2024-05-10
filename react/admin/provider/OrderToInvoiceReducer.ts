import { Item } from '../../../typings/InvoiceRequest'

// When adding PartialBy in a field, it's necessary to the validation in the function isReturnRequestArgs
export interface InvoiceState {
  type: string
  description: string
  issuanceDate: string
  invoiceNumber: string
  invoiceValue: number
  items: Array<Item>
  shippingCost: number
  invoiceKey: string
}

export const initialInvoiceState: InvoiceState = {
  type: 'Input',
  description: '',
  issuanceDate: new Date().toISOString(),
  invoiceNumber: '',
  invoiceValue: 0,
  items: [],
  shippingCost: 0,
  invoiceKey: JSON.stringify({ preRefund: false }),
}

const clearState = () => {
  return {
    type: 'clearState' as const,
    payload: initialInvoiceState,
  }
}
const updateShippingCost = (shippingCost: number) => {
  return {
    type: 'updateShippingCost' as const,
    payload: shippingCost,
  }
}
const updateInvoiceKey = (invoiceKey: string) => {
  return {
    type: 'updateInvoiceKey' as const,
    payload: invoiceKey,
  }
}
const updateInvoiceValue = (invoiceValue: number) => {
  return {
    type: 'updateInvoiceValue' as const,
    payload: invoiceValue,
  }
}
const updateInvoiceNumber = (invoiceNumber: string) => {
  return {
    type: 'updateInvoiceNumber' as const,
    payload: invoiceNumber,
  }
}
const updateItems = (items: InvoiceState['items']) => {
  return {
    type: 'updateItems' as const,
    payload: items,
  }
}

export type InvoiceRequestActions =
  | ReturnType<typeof clearState>
  | ReturnType<typeof updateItems>
  | ReturnType<typeof updateShippingCost>
  | ReturnType<typeof updateInvoiceNumber>
  | ReturnType<typeof updateInvoiceValue>
  | ReturnType<typeof updateInvoiceKey>

export const orderToInvoiceReducer = (
  state: InvoiceState,
  action: InvoiceRequestActions
) => {
  switch (action.type) {
    case 'clearState': {
      return action.payload
    }

    case 'updateItems': {
      return {
        ...state,
        items: action.payload,
      }
    }

    case 'updateShippingCost': {
      return {
        ...state,
        shippingCost: action.payload,
      }
    }

    case 'updateInvoiceNumber': {
      return {
        ...state,
        invoiceNumber: action.payload,
      }
    }

    case 'updateInvoiceKey': {
      return {
        ...state,
        invoiceKey: action.payload,
      }
    }

    case 'updateInvoiceValue': {
      return {
        ...state,
        invoiceValue: action.payload,
      }
    }

    default: {
      return state
    }
  }
}
