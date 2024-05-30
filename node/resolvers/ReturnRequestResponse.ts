import { ReturnRequest } from '../../typings/ReturnRequest'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

type VtexProduct = 'admin' | 'store' | undefined

export const removeSubmittedByForStoreUser = (
  statusData: ReturnRequest['refundStatusData'][number],
  vtexProduct: VtexProduct
) => {
  if (vtexProduct === 'store') {
    return {
      ...statusData,
      submittedBy: undefined,
    }
  }

  return statusData
}

// This function hides the submittedBy field and removes the comments that should not be visible to the store user
export const transformStatusForStoreUser = (
  refundStatusDataList: ReturnRequest['refundStatusData'],
  vtexProduct: VtexProduct
) => {
  return (
    refundStatusDataList?.map((statusData) => {
      return {
        ...removeSubmittedByForStoreUser(statusData, vtexProduct),
        comments: statusData.comments?.filter((comment) => {
          return vtexProduct !== 'store' || comment.visibleForCustomer
        }),
      }
    }) ?? []
  )
}

// This resolver allows the parent one to fetch just the root fields for a ReturnRequest.
// This stategy can save some kb when transfering data, since that in a search, we don't need all the fields.
export const ReturnRequestResponse = {
  refundableAmount: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, refundableAmount } = root

    if (refundableAmount) return refundableAmount

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['refundableAmount'],
      auth: appConfig,
    }
    const { refundableAmount: refundableAmountValue } =
      await returnRequestClient.get(payload)

    return refundableAmountValue
  },
  customerProfileData: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, customerProfileData } = root

    if (customerProfileData) return customerProfileData

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['customerProfileData'],
      auth: appConfig,
    }

    const { customerProfileData: customerProfile } =
      await returnRequestClient.get(payload)

    return customerProfile
  },
  refundableAmountTotals: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, refundableAmountTotals } = root

    if (refundableAmountTotals) return refundableAmountTotals

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['refundableAmountTotals'],
      auth: appConfig,
    }

    const { refundableAmountTotals: refundableAmountTotalsData } =
      await returnRequestClient.get(payload)

    return refundableAmountTotalsData
  },

  pickupReturnData: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, pickupReturnData } = root

    if (pickupReturnData) return pickupReturnData

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['pickupReturnData'],
      auth: appConfig,
    }

    const { pickupReturnData: pickupData } = await returnRequestClient.get(
      payload
    )

    return pickupData
  },

  refundPaymentData: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, refundPaymentData } = root

    if (refundPaymentData) return refundPaymentData

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['refundPaymentData'],
      auth: appConfig,
    }

    const { refundPaymentData: refundData } = await returnRequestClient.get(
      payload
    )

    return refundData
  },

  items: async (root: ReturnRequest, _args: unknown, ctx: Context) => {
    const { id, items } = root

    if (items) return items

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['items'],
      auth: appConfig,
    }

    const { items: itemsList } = await returnRequestClient.get(payload)

    return itemsList
  },

  refundData: async (root: ReturnRequest, _args: unknown, ctx: Context) => {
    const { id, refundData } = root

    if (refundData) return refundData

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['refundData'],
      auth: appConfig,
    }

    const { refundData: refundDataList } = await returnRequestClient.get(
      payload
    )

    return refundDataList
  },
  refundStatusData: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, refundStatusData } = root

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
      request: { header },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const vtexProduct = header['x-vtex-product'] as VtexProduct

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['refundStatusData'],
      auth: appConfig,
    }

    const { refundStatusData: refundStatusDataList } = refundStatusData
      ? { refundStatusData }
      : await returnRequestClient.get(payload)

    return transformStatusForStoreUser(refundStatusDataList, vtexProduct)
  },
  cultureInfoData: async (
    root: ReturnRequest,
    _args: unknown,
    ctx: Context
  ) => {
    const { id, cultureInfoData } = root

    if (cultureInfoData) return cultureInfoData

    const {
      clients: {
        return: returnRequestClient,
        account: accountClient,
        settingsAccount,
      },
    } = ctx

    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS
    if (!accountInfo?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const payload = {
      id: id as string,
      parentAccountName:
        accountInfo?.parentAccountName || appConfig?.parentAccountName,
      param: ['cultureInfoData'],
      auth: appConfig,
    }

    const { cultureInfoData: cultureInfo } = await returnRequestClient.get(
      payload
    )

    return cultureInfo
  },
  // Resolve dateSubmitted value into createdIn field because we lost the original value of createdIn (migration data from v2 to v3).
  createdIn: async (root: ReturnRequest) => {
    const { dateSubmitted } = root

    return dateSubmitted
  },
}
