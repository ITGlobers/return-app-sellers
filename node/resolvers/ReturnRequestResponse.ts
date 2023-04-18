import { ReturnRequest } from "../../typings/ReturnRequest"

type VtexProduct = 'admin' | 'store' | undefined

const removeSubmittedByForStoreUser = (
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
const transformStatusForStoreUser = (
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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { refundableAmount: refundableAmountValue } =
      await returnRequestClient.get(id as string, accountInfo , ['refundableAmount'])

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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { customerProfileData: customerProfile } =
      await returnRequestClient.get(id as string, accountInfo , ['customerProfileData'])

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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { refundableAmountTotals: refundableAmountTotalsData } =
      await returnRequestClient.get(
        id as string, 
        accountInfo,
        ['refundableAmountTotals'])

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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { pickupReturnData: pickupData } = await returnRequestClient.get(
      id as string,
      accountInfo,
      ['pickupReturnData']
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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { refundPaymentData: refundData } = await returnRequestClient.get(
      id as string,
      accountInfo,
      ['refundPaymentData']
    )

    return refundData
  },
  items: async (root: ReturnRequest, _args: unknown, ctx: Context) => {
    const { id, items } = root

    if (items) return items

    const {
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { items: itemsList } = await returnRequestClient.get(
      id as string, 
      accountInfo,
      ['items', ])

    return itemsList
  },
  refundData: async (root: ReturnRequest, _args: unknown, ctx: Context) => {
    const { id, refundData } = root

    if (refundData) return refundData

    const {
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { refundData: refundDataList } = await returnRequestClient.get(
      id as string,
      accountInfo,
      ['refundData']
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
      clients: { return: returnRequestClient , account : accountClient},
      request: { header },

    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const vtexProduct = header['x-vtex-product'] as VtexProduct

    const { refundStatusData: refundStatusDataList } = refundStatusData
      ? { refundStatusData }
      : await returnRequestClient.get(id as string, accountInfo, ['refundStatusData'])

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
      clients: { return: returnRequestClient , account : accountClient},
    } = ctx

    const accountInfo = await accountClient.getInfo()  

    const { cultureInfoData: cultureInfo } = await returnRequestClient.get(
      id as string,
      accountInfo,
      ['cultureInfoData']
    )

    return cultureInfo
  },
  // Resolve dateSubmitted value into createdIn field because we lost the original value of createdIn (migration data from v2 to v3).
  createdIn: async (root: ReturnRequest) => {
    const { dateSubmitted } = root

    return dateSubmitted
  },
}
