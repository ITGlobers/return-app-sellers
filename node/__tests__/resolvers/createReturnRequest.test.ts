import { ReturnRequestInput } from '../../../typings/ReturnRequest'
import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import { createReturnRequest } from '../../resolvers/createReturnRequest'
import { createReturnRequestService } from '../../services/createReturnRequestService'

jest.mock('../../services/createReturnRequestService', () => ({
  __esModule: true,
  createReturnRequestService: jest.fn(),
}))

describe('createReturnRequest', () => {
  let ctx: any

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = {
      state: {
        logs: [],
      },
    } as unknown as Context
  })

  it('should add log and call createReturnRequestService with correct arguments', async () => {
    const returnRequest: ReturnRequestInput = {
      orderId: '1100995411-01',
      userComment: null,
      sellerName: 'obiecomprod',
      items: [
        {
          orderItemIndex: 2,
          quantity: 1,
          condition: 'newWithBox',
          returnReason: {
            reason: '014',
            otherReason: 'Ventil öffnet und schließt nicht korrekt',
          },
        },
      ],
      pickupReturnData: {
        addressId: 'dummy',
        address: 'dummy',
        state: 'dummy',
        city: 'dummy',
        country: 'dummy',
        zipCode: 'dummy',
        addressType: 'CUSTOMER_ADDRESS',
      },
      locale: 'de-DE',
      refundPaymentData: {
        refundPaymentMethod: 'sameAsPurchase',
        iban: null,
        accountHolderName: null,
      },
      customerProfileData: {
        name: 'dummy',
        email: 'test123@test.com',
        phoneNumber: 'dummy',
      },
    }

    const expectedResult = {}

    ;(createReturnRequestService as jest.Mock).mockResolvedValue(expectedResult)

    const result = await createReturnRequest({}, { returnRequest }, ctx)

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Resolver create Return Request',
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify(returnRequest),
        },
      },
    ])

    expect(createReturnRequestService).toHaveBeenCalledWith(ctx, returnRequest)

    expect(result).toEqual(expectedResult)
  })
})
