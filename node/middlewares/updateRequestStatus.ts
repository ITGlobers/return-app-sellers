import { json } from 'co-body'

import { updateRequestStatusService } from '../services/updateRequestStatusService'

export async function updateRequestStatus(ctx: Context) {
  const {
    req,
    vtex: {
      route: { params },
      account,
    },
  } = ctx

  const { requestId } = params as { requestId: string }

  const body = await json(req)

  const updatedRequestData = {
    requestId,
    sellerName: account,
    status: body.status,
    comment: body.comment,
    ...{
      ...(body.refundData && { refundData: body.refundData }),
    },
  }

  const updatedRequest = await updateRequestStatusService(
    ctx,
    updatedRequestData
  )

  ctx.set('Cache-Control', 'no-cache')
  ctx.body = updatedRequest
  ctx.status = 200
}
