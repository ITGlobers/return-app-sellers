import { ExternalLogSeverity } from '../middlewares/errorHandler'
import createInvoiceService from '../services/invoice/createInvoiceService'

export const createInvoiceRequest = async (
  _: unknown,
  args: any,
  ctx: Context
): Promise<any> => {
  const { orderId, invoiceRequest } = args
  if (!ctx.state.logs) ctx.state.logs = []
  ctx.state.logs.push({
    message: 'Request received',
    middleware: 'Resolver create Invoice',
    severity: ExternalLogSeverity.INFO,
    payload: {
      details: 'Body of the request captured',
      stack: JSON.stringify(invoiceRequest),
    },
  })
  return await createInvoiceService(ctx, invoiceRequest, orderId)
}
