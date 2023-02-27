import type { MutationCreateReturnRequestArgs } from 'obidev.obi-return-app-sellers'

import { createReturnRequestService } from '../services/createReturnRequestService'

export const createReturnRequest = async (
  _: unknown,
  args: MutationCreateReturnRequestArgs,
  ctx: Context
) => {
  const { returnRequest } = args

  return createReturnRequestService(ctx, returnRequest)
}
