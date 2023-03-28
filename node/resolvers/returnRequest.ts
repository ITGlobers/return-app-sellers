import type { QueryReturnRequestArgs } from 'vtexromania.obi-return-app-sellers'

import { returnRequestService } from '../services/returnRequestService'

export const returnRequest = async (
  _: unknown,
  { requestId }: QueryReturnRequestArgs,
  ctx: Context
) => {
  return returnRequestService(ctx, requestId)
}
