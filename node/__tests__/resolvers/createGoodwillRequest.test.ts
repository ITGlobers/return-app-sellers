import { ExternalLogSeverity } from '../../middlewares/errorHandler'
import { createGoodwillRequest } from '../../resolvers/createGoodwillRequest'
import { createGoodwillService } from '../../services/goodwill/createGoodwillService'

jest.mock('../../services/goodwill/createGoodwillService', () => ({
  createGoodwillService: jest.fn(),
}))

describe('createGoodwillRequest', () => {
  let ctx: any

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = {
      state: {
        logs: [],
      },
    } as unknown as Context
  })

  it('should add log and call createGoodwillService with correct arguments', async () => {
    const goodwillRequest: Goodwill = {
      orderId: 'SLR-1100306545-01',
      sellerId: 'obiecomstage',
      goodwillCreditId: '1004002',
      reason: 'Lieferverzug',
      goodwillCreditAmount: 1000,
      shippingCost: 0,
      items: [
        {
          id: '3938479',
          amount: 1000,
          description: 'individuell - sonstiges',
        },
      ],
      status: 'draft',
      id: '',
      logs: [
        {
          detail: '',
        },
      ],
    }

    const expectedResult = {
      message: 'Success message',
      goodwill: goodwillRequest,
    }

    ;(createGoodwillService as jest.Mock).mockResolvedValue(expectedResult)

    const result = await createGoodwillRequest({}, { goodwillRequest }, ctx)

    expect(ctx.state.logs).toEqual([
      {
        message: 'Request received',
        middleware: 'Resolver create Goodwill',
        severity: ExternalLogSeverity.INFO,
        payload: {
          details: 'Body of the request captured',
          stack: JSON.stringify(goodwillRequest),
        },
      },
    ])

    expect(createGoodwillService).toHaveBeenCalledWith(ctx, goodwillRequest)

    expect(result).toEqual(expectedResult)
  })
})
