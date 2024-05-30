import { UserInputError } from '@vtex/api'
import { ReturnRequestItemInput } from '../../../typings/ReturnRequest'
import { validateItemCondition } from '../../utils/validateItemCondition'

describe('validateItemCondition', () => {
  it('throws a UserInputError when considerCondition is true and an item has no condition', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        quantity: 1,
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 1,
        quantity: 2,
        condition: undefined,
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 2,
        quantity: 1,
        condition: 'unspecified',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
    ]

    expect(() => {
      validateItemCondition(itemsToReturn, true)
    }).toThrow(UserInputError)
  })

  it('does not throw an error when considerCondition is false', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        quantity: 1,
        condition: 'newWithBox',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 1,
        quantity: 2,
        condition: undefined,
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 2,
        quantity: 1,
        condition: 'unspecified',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
    ]

    expect(() => {
      validateItemCondition(itemsToReturn, false)
    }).not.toThrow()
  })

  it('does not throw an error when considerCondition is null', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        quantity: 1,
        condition: 'newWithBox',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 1,
        quantity: 2,
        condition: undefined,
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 2,
        quantity: 1,
        condition: 'unspecified',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
    ]

    expect(() => {
      validateItemCondition(itemsToReturn, null)
    }).not.toThrow()
  })

  it('does not throw an error when all items have a specified condition and considerCondition is true', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        quantity: 1,
        condition: 'newWithBox',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 1,
        quantity: 2,
        condition: 'newWithBox',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
      {
        orderItemIndex: 2,
        quantity: 1,
        condition: 'newWithBox',
        returnReason: {
          reason: '',
          otherReason: undefined,
        },
      },
    ]

    expect(() => {
      validateItemCondition(itemsToReturn, true)
    }).not.toThrow()
  })
})
