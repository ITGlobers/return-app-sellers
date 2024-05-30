import { Context } from 'koa'
import { ping } from '../../middlewares/ping'

describe('ping', () => {
  let ctx: any
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    ctx = {
      response: {
        status: 0,
        body: '',
      },
      set: jest.fn(),
    } as unknown as Context
  })

  it('should set status to 200 and respond with Ping check', async () => {
    await ping(ctx, next)

    expect(ctx.response.status).toBe(200)
    expect(ctx.response.body).toBe('Ping check')
    expect(ctx.set).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store')
    expect(ctx.set).toHaveBeenCalledWith('pragma', 'no-cache, no-store')
    expect(next).toHaveBeenCalled()
  })
})
