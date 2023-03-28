import type { QueryReturnRequestListArgs } from 'vtexromania.obi-return-app-sellers'

import { returnRequestListService } from '../services/returnRequestListService'

export const returnRequestList = (
  _: unknown,
  args: QueryReturnRequestListArgs,
  ctx: Context
) => {
  return returnRequestListService(ctx, args)
}
