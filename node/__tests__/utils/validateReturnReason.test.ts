jest.mock('../../utils/dateHelpers', () => ({
  isWithinMaxDaysToReturn: jest.fn(),
}))

import { ResolverError, UserInputError } from '@vtex/api'
import { ReturnRequestItemInput } from '../../../typings/ReturnRequest'
import { validateReturnReason } from '../../utils/validateReturnReason'
import { CustomReturnReason } from '../../../typings/ReturnAppSettings'
import { isWithinMaxDaysToReturn } from '../../utils/dateHelpers'

describe('validateReturnReason', () => {
  const mockIsWithinMaxDaysToReturn = isWithinMaxDaysToReturn as jest.Mock

  beforeEach(() => {
    mockIsWithinMaxDaysToReturn.mockReset()
  })

  it('throws a UserInputError when any item has no return reason', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        returnReason: { reason: '' },
        quantity: 0,
      },
    ]

    expect(() => {
      validateReturnReason(itemsToReturn, '2023-01-01T00:00:00Z')
    }).toThrow(UserInputError)
  })

  it('does not throw an error when no custom return reasons are provided', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        returnReason: { reason: 'damaged' },
        quantity: 0,
      },
    ]

    expect(() => {
      validateReturnReason(itemsToReturn, '2023-01-01T00:00:00Z', null)
    }).not.toThrow()
  })

  it('throws a ResolverError when a return reason is not valid according to the custom reasons provided', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        returnReason: { reason: 'invalidReason' },
        quantity: 0,
      },
    ]
    const customReturnReasons: CustomReturnReason[] = [
      {
        reason: 'damaged',
        maxDays: 30,
        translations: [
          {
            translation: 'damaged',
            locale: '',
          },
        ],
      },
    ]

    expect(() => {
      validateReturnReason(
        itemsToReturn,
        '2023-01-01T00:00:00Z',
        customReturnReasons
      )
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when an item is not within the max days for the return reason', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        returnReason: { reason: 'damaged' },
        quantity: 0,
      },
    ]
    const customReturnReasons: CustomReturnReason[] = [
      {
        reason: 'damaged',
        maxDays: 30,
        translations: [
          {
            translation: 'damaged',
            locale: '',
          },
        ],
      },
    ]
    mockIsWithinMaxDaysToReturn.mockReturnValue(false)

    expect(() => {
      validateReturnReason(
        itemsToReturn,
        '2023-01-01T00:00:00Z',
        customReturnReasons
      )
    }).toThrow(ResolverError)
  })

  it('does not throw an error when all conditions are met correctly', () => {
    const itemsToReturn: ReturnRequestItemInput[] = [
      {
        orderItemIndex: 0,
        returnReason: { reason: 'damaged' },
        quantity: 0,
      },
    ]
    const customReturnReasons: CustomReturnReason[] = [
      {
        reason: 'damaged',
        maxDays: 30,
        translations: [
          {
            translation: 'damaged',
            locale: '',
          },
        ],
      },
    ]
    mockIsWithinMaxDaysToReturn.mockReturnValue(true)

    expect(() => {
      validateReturnReason(
        itemsToReturn,
        '2023-01-01T00:00:00Z',
        customReturnReasons
      )
    }).not.toThrow()
  })
})
