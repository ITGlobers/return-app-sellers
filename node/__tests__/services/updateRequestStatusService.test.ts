import { ReturnRequest } from '../../../typings/ReturnRequest'
import { updateRequestStatus } from '../../middlewares/updateRequestStatus'
import { updateRequestStatusService } from '../../services/updateRequestStatusService'
import { json } from 'co-body'

jest.mock('co-body', () => ({
  json: jest.fn().mockResolvedValue({}),
}))

jest.mock('../../services/updateRequestStatusService', () => ({
  updateRequestStatusService: jest.fn(),
}))

describe('updateRequestStatus', () => {
  let ctx: Context

  beforeEach(() => {
    ctx = {
      req: {
        status: 'new',
        comment: 'test comment',
      },
      vtex: {
        route: { params: { requestId: '123' } },
        account: 'mockAccount',
      },
      set: jest.fn(),
      body: '',
      status: 200,
    } as unknown as Context
  })

  it('should update request status and return 200', async () => {
    const mockReturnRequest: ReturnRequest = {
      orderId: 'mockOrderId',
      refundableAmount: 100,
      sequenceNumber: '1',
      status: 'new',
      refundableAmountTotals: [{ id: 'items', value: 100 }],
      customerProfileData: {
        userId: 'mockUserId',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
      },
      pickupReturnData: {
        addressId: 'mockAddressId',
        address: '123 Mock St',
        city: 'Mock City',
        state: 'Mock State',
        country: 'Mock Country',
        zipCode: '12345',
        addressType: 'PICKUP_POINT',
      },
      refundPaymentData: {
        refundPaymentMethod: 'bank',
      },
      items: [],
      dateSubmitted: '2024-05-21T12:00:00Z',
      refundData: null,
      refundStatusData: [],
      cultureInfoData: {
        currencyCode: 'USD',
        locale: 'en-US',
      },
    }

    const mockUpdateRequestStatusService =
      updateRequestStatusService as jest.MockedFunction<
        typeof updateRequestStatusService
      >
    mockUpdateRequestStatusService.mockResolvedValueOnce(mockReturnRequest)

    const mockJson = json as jest.MockedFunction<typeof json>
    mockJson.mockResolvedValue({ status: 'new', comment: 'test comment' })

    await updateRequestStatus(ctx)

    expect(mockUpdateRequestStatusService).toHaveBeenCalledWith(ctx, {
      requestId: '123',
      sellerName: 'mockAccount',
      status: 'new',
      comment: 'test comment',
    })
    expect(ctx.set).toHaveBeenCalledWith('Cache-Control', 'no-cache')
    expect(ctx.body).toEqual(mockReturnRequest)
    expect(ctx.status).toBe(200)
  })
})
