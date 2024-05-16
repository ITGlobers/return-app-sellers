import { ResolverError } from '@vtex/api'

import type {
  ParamsUpdateReturnRequestStatus,
  ReturnRequest,
} from '../../typings/ReturnRequest'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const updateRequestStatusService = async (
  ctx: Context,
  params: ParamsUpdateReturnRequestStatus
): Promise<ReturnRequest> => {
  const {
    clients: { return: returnClient, account: accountClient, settingsAccount },
  } = ctx

  let updatedRequest: any = null

  const { requestId } = params

  const { vtexidclientautcookie } = ctx.request.headers

  const accountInfo = await accountClient.getInfo(
    vtexidclientautcookie as string
  )

  let appConfig: Settings = DEFAULT_SETTINGS

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  try {
    updatedRequest = await returnClient.updateReturn({
      returnId: requestId,
      updatedRequest: params,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      auth: appConfig,
    })
  } catch (error) {
    const mdValidationErrors = error?.response?.data?.errors[0]?.errors

    const errorMessageString = mdValidationErrors
      ? JSON.stringify(
          {
            message: 'Schema Validation error',
            errors: mdValidationErrors,
          },
          null,
          2
        )
      : error.message

    throw new ResolverError(errorMessageString, error.response?.status || 500)
  }

  return { id: requestId, ...updatedRequest }
}
