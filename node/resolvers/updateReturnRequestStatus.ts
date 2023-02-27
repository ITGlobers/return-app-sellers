import type {
  MutationUpdateReturnRequestStatusArgs,
  ReturnRequest,
} from 'obidev.obi-return-app-sellers'

import { updateRequestStatusService } from '../services/updateRequestStatusService'

export const updateReturnRequestStatus = (
  _: unknown,
  args: MutationUpdateReturnRequestStatusArgs,
  ctx: Context
): Promise<ReturnRequest> => updateRequestStatusService(ctx, args)
