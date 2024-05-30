import { ResolverError } from '@vtex/api'
import { canOrderBeReturned } from '../../utils/canOrderBeReturned'

describe('canOrderBeReturned', () => {
  it('should throw ResolverError with OUT_OF_MAX_DAYS code if creationDate is not within maxDays', () => {
    const creationDate = '2023-05-01'
    const maxDays = 30
    const status = 'invoiced'
    const orderStatus = 'partial-invoiced'

    expect(() =>
      canOrderBeReturned({
        creationDate,
        maxDays,
        status,
        orderStatus,
      })
    ).toThrowError(ResolverError)
  })

  it('should throw ResolverError with ORDER_NOT_INVOICED code if orderStatus is not "partial-invoiced" and status is not "invoiced"', () => {
    const creationDate = '2024-05-01'
    const maxDays = 30
    const status = 'shipped'
    const orderStatus = 'shipped'

    expect(() =>
      canOrderBeReturned({
        creationDate,
        maxDays,
        status,
        orderStatus,
      })
    ).toThrowError(ResolverError)
  })

  it('should not throw errors if creationDate is within maxDays and orderStatus is "partial-invoiced"', () => {
    const creationDate = '2024-05-01'
    const maxDays = 30
    const status = 'invoiced'
    const orderStatus = 'partial-invoiced'

    expect(() =>
      canOrderBeReturned({ creationDate, maxDays, status, orderStatus })
    ).not.toThrow()
  })

  it('should not throw errors if creationDate is within maxDays and status is "invoiced"', () => {
    const creationDate = '2024-05-01'
    const maxDays = 30
    const status = 'invoiced'
    const orderStatus = 'invoiced'

    expect(() =>
      canOrderBeReturned({ creationDate, maxDays, status, orderStatus })
    ).not.toThrow()
  })
})
