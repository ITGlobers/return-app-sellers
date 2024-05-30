import { ResolverError } from '@vtex/api'
import { ReturnRequest } from '../../typings/ReturnRequest'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const returnRequestService = async (ctx: Context, requestId: string) => {
  const {
    header,
    clients: { return: returnClient, account: accountClient, settingsAccount },
    state: { userProfile, appkey },
  } = ctx
  const { userId, role } = userProfile ?? {}
  const userIsAdmin = Boolean(appkey) || role === 'admin'
  const authCookie = header.vtexidclientautcookie as string | undefined

  const accountInfo = await accountClient.getInfo(authCookie)
  let appConfig: Settings = DEFAULT_SETTINGS

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const payload = {
    returnId: requestId,
    parentAccountName:
      accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig,
  }

  const returnRequestResult = await returnClient.getReturnById(payload)

  if (!returnRequestResult) {
    // Code error 'E_HTTP_404' to match the one when failing to find and order by OMS
    throw new ResolverError(`Request ${requestId} not found`, 404, 'E_HTTP_404')
  }

  const { customerProfileData } = returnRequestResult as ReturnRequest

  const requestBelongsToUser = userId === customerProfileData?.userId

  if (!requestBelongsToUser && !userIsAdmin) {
    // throw new ForbiddenError('User cannot access this request')
  }

  return returnRequestResult
}
