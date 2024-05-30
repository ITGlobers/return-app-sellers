import {
  SETTINGS_PATH,
  STATUS_INVOICED,
  STATUS_PAYMENT_APPROVE,
  BASE_URL,
  ORDER_TO_RETURN_VALIDATON,
  OMS_RETURN_REQUEST_CONFIRMATION,
  OMS_RETURN_REQUEST_CONFIRMATION_FRIENDLY_NAME,
  OMS_RETURN_REQUEST_STATUS_UPDATE,
  OMS_RETURN_REQUEST_STATUS_UPDATE_FRIENDLY_NAME,
} from '../../utils/constants'

describe('Constants and Utility Functions', () => {
  it('should have correct SETTINGS_PATH', () => {
    expect(SETTINGS_PATH).toBe('app-settings')
  })

  it('should have correct STATUS_INVOICED', () => {
    expect(STATUS_INVOICED).toBe('invoiced')
  })

  it('should have correct STATUS_PAYMENT_APPROVE', () => {
    expect(STATUS_PAYMENT_APPROVE).toBe('handling')
  })

  it('should generate correct BASE_URL', () => {
    const accountName = 'test-account'
    const expectedUrl = `http://app.io.vtex.com/test-account.return-app/v3/`
    expect(BASE_URL(accountName)).toBe(expectedUrl)
  })

  it('should have correct ORDER_TO_RETURN_VALIDATON values', () => {
    expect(ORDER_TO_RETURN_VALIDATON.OUT_OF_MAX_DAYS).toBe('OUT_OF_MAX_DAYS')
    expect(ORDER_TO_RETURN_VALIDATON.ORDER_NOT_INVOICED).toBe(
      'ORDER_NOT_INVOICED'
    )
  })

  it('should generate correct OMS_RETURN_REQUEST_CONFIRMATION template ID', () => {
    const locale = 'en-GB'
    const expectedTemplateId = 'oms-return-request-confirmation_en-GB'
    expect(OMS_RETURN_REQUEST_CONFIRMATION(locale)).toBe(expectedTemplateId)
  })

  it('should generate correct OMS_RETURN_REQUEST_CONFIRMATION_FRIENDLY_NAME', () => {
    const locale = 'en-GB'
    const expectedFriendlyName = '[OMS] Return Request Confirmation_en-GB'
    expect(OMS_RETURN_REQUEST_CONFIRMATION_FRIENDLY_NAME(locale)).toBe(
      expectedFriendlyName
    )
  })

  it('should generate correct OMS_RETURN_REQUEST_STATUS_UPDATE template ID', () => {
    const locale = 'en-GB'
    const expectedTemplateId = 'oms-return-request-status-update_en-GB'
    expect(OMS_RETURN_REQUEST_STATUS_UPDATE(locale)).toBe(expectedTemplateId)
  })

  it('should generate correct OMS_RETURN_REQUEST_STATUS_UPDATE_FRIENDLY_NAME', () => {
    const locale = 'en-GB'
    const expectedFriendlyName = '[OMS] Return Request Status Update_en-GB'
    expect(OMS_RETURN_REQUEST_STATUS_UPDATE_FRIENDLY_NAME(locale)).toBe(
      expectedFriendlyName
    )
  })
})
