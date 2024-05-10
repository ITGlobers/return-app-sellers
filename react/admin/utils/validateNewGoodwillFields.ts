import { GoodwillRequestInput } from '../../../typings/GoodwillRequest'
import type { OrderSummaryState } from '../provider/OrderToGoodwillReducer'

export type ErrorsValidation = 'no-item-selected' | 'reason-or-condition'

interface ValidationError {
  errors: ErrorsValidation[]
  validatedFields?: never
}

interface ValidationSuccess {
  errors?: never
  validatedFields: GoodwillRequestInput
}

export const validateNewGoodwillRequestFields = (
  goodwillRequest: OrderSummaryState
): ValidationError | ValidationSuccess => {
  const { items } = goodwillRequest

  const errors: ErrorsValidation[] = []

  const itemsToReturn = items.filter((item) => item.amount > 0)

  if (itemsToReturn.length === 0) {
    errors.push('no-item-selected')
  }

  if (errors.length) {
    return { errors }
  }

  const validatedFields: GoodwillRequestInput = {
    ...goodwillRequest,
  }

  return { validatedFields }
}
