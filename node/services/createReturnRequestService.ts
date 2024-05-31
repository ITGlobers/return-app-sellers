import { UserInputError, ResolverError } from '@vtex/api'
//import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import { canReturnAllItems } from '../utils/canReturnAllItems'
import { validateReturnReason } from '../utils/validateReturnReason'
import { validatePaymentMethod } from '../utils/validatePaymentMethod'
import { validateCanUsedropoffPoints } from '../utils/validateCanUseDropoffPoints'
import { createItemsToReturn } from '../utils/createItemsToReturn'
import { createRefundableTotals } from '../utils/createRefundableTotals'
import { getCustomerEmail } from '../utils/getCostumerEmail'
import { validateItemCondition } from '../utils/validateItemCondition'
import { ReturnRequestInput } from '../../typings/ReturnRequest'
import { ReturnRequestCreated } from '../../typings/ProductReturned'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const createReturnRequestService = async (
  ctx: Context,
  args: ReturnRequestInput
): Promise<ReturnRequestCreated> => {
  const {
    clients: {
      oms,
      return: returnRequestClient,
      order: orderRequestClient,
      returnSettings,
      account: accountClient,
      catalog,
      catalogGQL,
      settingsAccount,
    },
    state: { userProfile, appkey },
    vtex: { logger },
  } = ctx

  const {
    orderId,
    marketplaceOrderId,
    items,
    customerProfileData,
    pickupReturnData,
    refundPaymentData,
    userComment,
    locale,
  } = args

  const submittedBy = getSubmittedBy(userProfile, appkey)
  const requestDate = new Date().toISOString()

  // Check items since a request via endpoint might not have it.
  // Graphql validation doesn't prevent user to send empty items
  if (!items?.length) {
    throw new UserInputError('There are no items in the request')
  }

  // For requests where orderId is an empty string
  if (!orderId) {
    throw new UserInputError('Order ID is missing')
  }
  const orderPromise = oms.order(orderId, 'AUTH_TOKEN')

  const accountInfo = await accountClient.getInfo()

  let appConfig: Settings = DEFAULT_SETTINGS
  let isSellerPortal: boolean = false

  if (!accountInfo?.parentAccountName) {
    isSellerPortal = true
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const body = {
    fields: ['id'],
    filter: `orderId=${marketplaceOrderId}`,
  }

  const parentAccountName =
    accountInfo?.parentAccountName || appConfig.parentAccountName

  const searchRMAPromise = await orderRequestClient.getOrdersList({
    body,
    parentAccountName,
    auth: appConfig,
  })

  const settingsPromise = returnSettings.getReturnSettingsMket({
    parentAccountName,
    auth: appConfig,
  })

  // If order doesn't exist, it throws an error and stop the process.
  // If there is no request created for that order, request searchRMA will be an empty array.
  const [order, searchRMA, settings] = await Promise.all([
    orderPromise,
    searchRMAPromise,
    settingsPromise,
  ])
  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }
  const {
    pagination: { total },
  } = searchRMA

  const {
    sequence,
    clientProfileData,
    items: orderItems,
    totals,
    creationDate,
    status,
    sellers,
    // @ts-expect-error itemMetadata is not typed in the OMS client project
    itemMetadata,
    shippingData,
    storePreferencesData: { currencyCode },
  } = order
  if (!pickupReturnData.state) {
    pickupReturnData.state = pickupReturnData.state || ''
  }

  const {
    maxDays,
    excludedCategories,
    customReturnReasons,
    paymentOptions,
    options: settingsOptions,
    orderStatus,
  } = settings
  /*
    isUserAllowed({
      requesterUser: userProfile,
      clientProfile: clientProfileData,
      appkey,
    })
  */
  canOrderBeReturned({
    creationDate,
    maxDays,
    status,
    orderStatus,
  })

  // Validate if all items are available to be returned
  await canReturnAllItems(items, {
    order,
    excludedCategories,
    orderRequestClient,
    catalog,
    catalogGQL,
    accountInfo: isSellerPortal
      ? { ...appConfig, isSellerPortal: true }
      : { ...accountInfo, isSellerPortal: false },
  })

  // Validate maxDays for custom reasons.
  validateReturnReason(items, creationDate, customReturnReasons)

  // Validate payment methods
  validatePaymentMethod(refundPaymentData, paymentOptions)

  // validate address type
  validateCanUsedropoffPoints(
    pickupReturnData,
    settingsOptions?.enablePickupPoints
  )

  // validate item condition
  validateItemCondition(items, settingsOptions?.enableSelectItemCondition)

  // Possible bug here: If someone deletes a request, it can lead to a duplicated sequence number.
  // Possible alternative: Save a key value pair in to VBase where key is the orderId and value is either the latest sequence (as number) or an array with all Ids, so we can use the length to calcualate the next seuqence number.
  const sequenceNumber = `${sequence}-${total + 1}`

  const itemsToReturn = await createItemsToReturn({
    itemsToReturn: items,
    orderItems,
    sellers,
    itemMetadata,
    catalog,
    catalogGQL,
    isSellerPortal,
  })
  const refundableAmountTotals = createRefundableTotals(
    itemsToReturn,
    totals,
    settings?.options?.enableProportionalShippingValue
  )

  const refundableAmount = refundableAmountTotals.reduce(
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    (amount, cur) => amount + cur.value,
    0
  )

  const userCommentData = userComment
    ? [
        {
          comment: userComment,
          createdAt: requestDate,
          submittedBy,
          visibleForCustomer: true,
          role: 'storeUser' as const,
        },
      ]
    : []

  // customerProfileData can be undefined when coming from a endpoint request
  const { email: inputEmail } = customerProfileData ?? {}
  const customerEmail = getCustomerEmail(
    clientProfileData,
    {
      userProfile,
      appkey,
      inputEmail,
    },
    {
      logger,
    }
  )

  const { refundPaymentMethod } = refundPaymentData

  const { iban, accountHolderName, ...refundPaymentMethodSubset } =
    refundPaymentData

  const refundPaymentDataResult =
    refundPaymentMethod === 'bank'
      ? refundPaymentData
      : refundPaymentMethodSubset

  const { automaticallyRefundPaymentMethod } = paymentOptions

  const createInvoiceTypeInput =
    refundPaymentMethod === 'sameAsPurchase'
      ? Boolean(automaticallyRefundPaymentMethod)
      : null

  try {
    const request = {
      sellerName: accountInfo.accountName,
      orderId: marketplaceOrderId,
      refundableAmount,
      sequenceNumber,
      status: 'new',
      refundableAmountTotals,
      customerProfileData: {
        userId: clientProfileData.userProfileId,
        name: customerProfileData.name,
        email: customerEmail,
        phoneNumber: customerProfileData.phoneNumber,
      },
      pickupReturnData,
      refundPaymentData: {
        ...refundPaymentDataResult,
        automaticallyRefundPaymentMethod: createInvoiceTypeInput,
      },
      items: itemsToReturn,
      dateSubmitted: requestDate,
      refundData: null,
      refundStatusData: [
        {
          status: 'new',
          submittedBy,
          createdAt: requestDate,
          comments: userCommentData,
        },
      ],
      cultureInfoData: {
        currencyCode,
        locale,
      },
      logisticsInfo: {
        currier: shippingData?.logisticsInfo
          .map((logisticInfo: any) => logisticInfo?.deliveryCompany)
          ?.join(','),
        sla: shippingData?.logisticsInfo
          .map((logisticInfo: any) => logisticInfo?.selectedSla)
          ?.join(','),
      },
    }

    const payload = {
      createRequest: request,
      parentAccountName,
    }

    const rmaDocument = await returnRequestClient.createReturn(payload)

    return { returnRequestId: rmaDocument.returnRequestId }
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
}

export const getSubmittedBy = async (
  userProfile?: UserProfile,
  appkey?: string
) => {
  const { firstName, lastName, email } = userProfile ?? {}
  const submittedByNameOrEmail =
    firstName || lastName ? `${firstName} ${lastName}` : email

  // If request was validated using appkey and apptoken, we assign the appkey as a sender
  // Otherwise, we try to use requester name. Email is the last resort.
  const submittedBy = appkey ?? submittedByNameOrEmail

  if (!submittedBy) {
    throw new ResolverError(
      'Unable to get submittedBy from context. The request is missing the userProfile info or the appkey'
    )
  }
  return submittedBy
}
