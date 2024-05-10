// import { ForbiddenError } from '@vtex/api'
import type { QueryReturnRequestListArgs } from '../../typings/ReturnRequest'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const returnRequestListService = async (
  ctx: Context,
  args: QueryReturnRequestListArgs
) => {
  const {
    clients: { return: returnClient, account: accountClient, settingsAccount },
    request: { header },
    state: { userProfile, appkey },
  } = ctx

  const { page, perPage, filter } = args
  const {
    userId: userIdProfile,
    email: userEmailProfile,
    role,
  } = userProfile ?? {}

  const { userId: userIdArg, userEmail: userEmailArg } = filter ?? {}

  const userIsAdmin = Boolean(appkey) || role === 'admin'

  // only admin users can pass userId or userEmail in the request.
  // For non admin users, the userId or userEmail must be gotten from cookie session.
  // Otherwise, a non admin user could search for another user's return requests
  const userId = userIsAdmin ? userIdArg || userIdProfile : userIdProfile
  const userEmail = userIsAdmin
    ? userEmailArg || userEmailProfile
    : userEmailProfile

  // vtexProduct is undefined when coming from GraphQL IDE or from a external request
  const vtexProduct = header['x-vtex-product'] as 'admin' | 'store' | undefined

  // When the user is not admin or the request is coming from the store, we need to apply the user filter to get the right requests
  const requireFilterByUser =
    !userIsAdmin || vtexProduct === 'store' || role === 'store-user'

  const hasUserIdOrEmail = Boolean(userId || userEmail)

  if (requireFilterByUser && !hasUserIdOrEmail) {
    // throw new ForbiddenError('Missing params to filter by store user')
  }

  const adjustedFilter = requireFilterByUser
    ? { ...filter, userId, userEmail }
    : filter

  const authCookie = header.vtexidclientautcookie as string | undefined

  const accountInfo = await accountClient.getInfo(authCookie)
  let appConfig: Settings = DEFAULT_SETTINGS

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const createdIn = adjustedFilter?.createdIn
    ? [`${adjustedFilter?.createdIn.from},${adjustedFilter?.createdIn.to}`]
    : undefined

  const payload = {
    params: {
      _page: page,
      _pageSize: perPage && perPage <= 100 ? perPage : 25,
      _perPage: perPage,
      _status: adjustedFilter?.status,
      _sequenceNumber: adjustedFilter?.sequenceNumber,
      _id: adjustedFilter?.id,
      _dateSubmitted: createdIn,
      _orderId: adjustedFilter?.orderId,
      _userEmail: adjustedFilter?.userEmail,
      _sellerName: accountInfo.accountName,
    },
    parentAccountName:
      accountInfo?.parentAccountName || appConfig?.parentAccountName,
  }
  const rmaSearchResult = await returnClient.getReturnList(payload)

  const { list, paging } = rmaSearchResult

  return {
    list,
    paging,
  }
}
