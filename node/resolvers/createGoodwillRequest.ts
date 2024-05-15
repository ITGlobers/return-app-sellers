import { ExternalLogSeverity } from '../middlewares/errorHandler'
import { createGoodwillService } from '../services/goodwill/createGoodwillService'

export const createGoodwillRequest = async (
  _: unknown,
  args: { goodwillRequest: Goodwill },
  ctx: Context
): Promise<{
  message: string
  goodwill: Goodwill
}> => {
  const { goodwillRequest } = args
  if (!ctx.state.logs) ctx.state.logs = []
  ctx.state.logs.push({
    message: 'Request received',
    middleware: 'Resolver create Goodwill',
    severity: ExternalLogSeverity.INFO,
    payload: {
      details: 'Body of the request captured',
      stack: JSON.stringify(goodwillRequest),
    },
  })

  return await createGoodwillService(ctx, goodwillRequest)
}
