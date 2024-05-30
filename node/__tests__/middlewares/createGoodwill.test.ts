import { createGoodwill } from '../../middlewares/goodwill/createGoodwill'

jest.mock('co-body', () => ({
  json: jest.fn().mockResolvedValue({
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
  }),
}))

jest.mock('../../services/goodwill/createGoodwillService', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    message: 'Success message',
    goodwill: {
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
    },
  }),
}))

describe('createGoodwill', () => {
  let ctx: any
  let next: jest.Mock<any, any>

  beforeEach(() => {
    ctx = {
      req: {},
      state: {
        logs: [],
      },
      set: jest.fn(),
    }
    next = jest.fn()
  }) as unknown as Context

  it('should handle request and call createGoodwillService', async () => {
    await createGoodwill(ctx, next)

    expect(ctx.state.logs).toHaveLength(1)
    expect(ctx.body).toEqual({
      message: 'Success message',
      goodwill: {
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
      },
    })
    expect(ctx.set).toHaveBeenCalledWith('Cache-Control', 'no-cache')
    expect(next).toHaveBeenCalled()
  })
})
