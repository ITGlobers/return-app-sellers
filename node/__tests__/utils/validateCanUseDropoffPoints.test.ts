import { ResolverError, UserInputError } from '@vtex/api'
import { PickupReturnDataInput } from '../../../typings/ReturnRequest'
import { validateCanUsedropoffPoints } from '../../utils/validateCanUseDropoffPoints'

describe('validateCanUsedropoffPoints', () => {
  it('throws a UserInputError when pickupReturnData is missing', () => {
    expect(() => {
      validateCanUsedropoffPoints(undefined)
    }).toThrow(UserInputError)
  })

  it('throws a ResolverError when addressType is PICKUP_POINT and isPickupPointsEnabled is false', () => {
    const pickupReturnData: PickupReturnDataInput = {
      addressType: 'PICKUP_POINT',
      addressId: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    }

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, false)
    }).toThrow(ResolverError)

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, null)
    }).toThrow(ResolverError)
  })

  it('does not throw an error when addressType is PICKUP_POINT and isPickupPointsEnabled is true', () => {
    const pickupReturnData: PickupReturnDataInput = {
      addressType: 'PICKUP_POINT',
      addressId: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    }

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, true)
    }).not.toThrow()
  })

  it('does not throw an error when addressType is not PICKUP_POINT', () => {
    const pickupReturnData: PickupReturnDataInput = {
      addressType: 'CUSTOMER_ADDRESS',
      addressId: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    }

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, false)
    }).not.toThrow()

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, true)
    }).not.toThrow()

    expect(() => {
      validateCanUsedropoffPoints(pickupReturnData, null)
    }).not.toThrow()
  })
})
