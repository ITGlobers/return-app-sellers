import { isValidIBANNumber } from '../../utils/isValidIBANNumber'

describe('isValidIBANNumber', () => {
  it('returns true for a valid IBAN number', () => {
    const validIBAN = 'DE89370400440532013000'
    expect(isValidIBANNumber(validIBAN)).toBe(true)
  })

  it('returns false for an invalid IBAN number', () => {
    const invalidIBAN = 'GB82WEST12345698765433'
    expect(isValidIBANNumber(invalidIBAN)).toBe(false)
  })

  it('returns true for an IBAN number with lowercase characters', () => {
    const ibanWithLowercase = 'gb82west12345698765432'
    expect(isValidIBANNumber(ibanWithLowercase)).toBe(true)
  })

  it('returns true for an IBAN number with special characters', () => {
    const ibanWithSpecialChars = 'GB82-WEST 1234_5698765432'
    expect(isValidIBANNumber(ibanWithSpecialChars)).toBe(true)
  })

  it('returns false for an empty string', () => {
    const emptyString = ''
    expect(isValidIBANNumber(emptyString)).toBe(false)
  })

  it('returns false for a string containing non-alphanumeric characters', () => {
    const nonAlphanumeric = '****'
    expect(isValidIBANNumber(nonAlphanumeric)).toBe(false)
  })
})
