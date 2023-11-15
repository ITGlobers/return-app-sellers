import { json } from 'co-body'
import createGoodwillService from '../../services/goodwill/createGoodwillService'

export async function createGoodwill(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  const {
    req,
  } = ctx
  const body = await json(req)

  
  try {
    console.log(body)
    ctx.body = await createGoodwillService(ctx, body as SellerGoodwill)
  } catch (error) {
    ctx.status = error.response?.status || 500
    ctx.body = {
      message:
        error.response?.data?.Message ||
        error.response?.data?.error ||
        error.message,
    }
  }

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
