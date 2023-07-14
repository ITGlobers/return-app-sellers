
import { ParamsUpdateReturnRequestStatus, ReturnRequest } from '../../typings/ReturnRequest'
import { updateRequestStatusService } from '../services/updateRequestStatusService'

export const updateReturnRequestStatus = (
  _: unknown,
  args: ParamsUpdateReturnRequestStatus,
  ctx: Context
): Promise<ReturnRequest> => updateRequestStatusService(ctx, args)
