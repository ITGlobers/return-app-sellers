import {
  CustomReturnReasonInput,
  PaymentOptionsInput,
} from '../../../typings/ReturnAppSettings'
import {
  validateMaxDaysCustomReasons,
  validatePaymentOptions,
  valideteUniqueCustomReasonsPerLocale,
} from '../../utils/appSettingsValidation'

describe('validatePaymentOptions', () => {
  it('should return payment options without modification if payment method selection is disabled', () => {
    const paymentOptions: PaymentOptionsInput = {
      enablePaymentMethodSelection: false,
      allowedPaymentTypes: {},
      automaticallyRefundPaymentMethod: true,
    }
    expect(validatePaymentOptions(paymentOptions)).toEqual(paymentOptions)
  })

  it('should throw an error if automaticallyRefundPaymentMethod is not a boolean when payment method selection is disabled', () => {
    const paymentOptions: PaymentOptionsInput = {
      enablePaymentMethodSelection: false,
      allowedPaymentTypes: {},
      automaticallyRefundPaymentMethod: 'true' as any,
    }
    expect(() => validatePaymentOptions(paymentOptions)).toThrow(Error)
  })

  it('should return adjusted payment options if payment method selection is enabled', () => {
    const paymentOptions: PaymentOptionsInput = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    }
    const expectedPaymentOptions: PaymentOptionsInput = {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: false,
    }
    expect(validatePaymentOptions(paymentOptions)).toEqual(
      expectedPaymentOptions
    )
  })
})

describe('validateMaxDaysCustomReasons', () => {
  it('should not throw error when customReturnReasons is undefined', () => {
    expect(() => validateMaxDaysCustomReasons(30, undefined)).not.toThrow(Error)
  })

  it('should not throw error when customReturnReasons is an empty array', () => {
    expect(() => validateMaxDaysCustomReasons(30, [])).not.toThrow(Error)
  })

  it('should not throw error when max days of custom reasons are less than or equal to general max days', () => {
    const customReturnReasons: CustomReturnReasonInput[] = [
      { reason: 'Reason 1', maxDays: 20 },
      { reason: 'Reason 2', maxDays: 30 },
    ]
    expect(() =>
      validateMaxDaysCustomReasons(30, customReturnReasons)
    ).not.toThrow(Error)
  })

  it('should throw error when max days of any custom reason is greater than general max days', () => {
    const customReturnReasons: CustomReturnReasonInput[] = [
      { reason: 'Reason 1', maxDays: 40 },
      { reason: 'Reason 2', maxDays: 50 },
    ]
    expect(() => validateMaxDaysCustomReasons(30, customReturnReasons)).toThrow(
      Error
    )
  })
})

describe('valideteUniqueCustomReasonsPerLocale', () => {
  it('should not throw error when customReturnReasons is undefined', () => {
    expect(() => valideteUniqueCustomReasonsPerLocale(undefined)).not.toThrow(
      Error
    )
  })

  it('should not throw error when customReturnReasons is an empty array', () => {
    expect(() => valideteUniqueCustomReasonsPerLocale([])).not.toThrow(Error)
  })

  it('should not throw error when each reason has unique translations for each locale', () => {
    const customReturnReasons: CustomReturnReasonInput[] = [
      {
        reason: 'Reason 1',
        maxDays: 10,
      },
      {
        reason: 'Reason 2',
        maxDays: 10,
      },
    ]
    expect(() =>
      valideteUniqueCustomReasonsPerLocale(customReturnReasons)
    ).not.toThrow(Error)
  })
})
