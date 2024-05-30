import { ResolverError } from '@vtex/api'
import { PaymentOptions } from '../../../typings/ReturnAppSettings'
import { RefundPaymentDataInput } from '../../../typings/ReturnRequest'
import { isValidIBANNumber } from '../../utils/isValidIBANNumber'
import { validatePaymentMethod } from '../../utils/validatePaymentMethod'

jest.mock('../../utils/isValidIBANNumber', () => ({
  isValidIBANNumber: jest.fn(),
}))

describe('validatePaymentMethod', () => {
  const mockIsValidIBANNumber = isValidIBANNumber as jest.Mock

  beforeEach(() => {
    mockIsValidIBANNumber.mockReset()
  })

  it('throws a ResolverError when payment selection is not enabled and method is not sameAsPurchase', () => {
    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: false,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when automaticallyRefundPaymentMethod is not boolean and method is sameAsPurchase', () => {
    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'sameAsPurchase',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: undefined,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when payment method is not allowed', () => {
    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when refundPaymentMethod is bank but IBAN is not provided', () => {
    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when refundPaymentMethod is bank but account holder name is not provided', () => {
    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
      iban: 'GB82WEST12345698765432',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('throws a ResolverError when refundPaymentMethod is bank but IBAN is not valid', () => {
    mockIsValidIBANNumber.mockReturnValue(false)

    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
      iban: 'INVALIDIBAN',
      accountHolderName: 'John Doe',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).toThrow(ResolverError)
  })

  it('does not throw an error when all conditions are met correctly', () => {
    mockIsValidIBANNumber.mockReturnValue(true)

    const refundPaymentData: RefundPaymentDataInput = {
      refundPaymentMethod: 'bank',
      iban: 'GB82WEST12345698765432',
      accountHolderName: 'John Doe',
    }
    const paymentSettings: PaymentOptions = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }

    expect(() => {
      validatePaymentMethod(refundPaymentData, paymentSettings)
    }).not.toThrow()
  })
})
