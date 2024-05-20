import { ResolverError, UserInputError } from '@vtex/api'
import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import { getCustomerEmail } from '../utils/getCostumerEmail'
import type { OrderToReturnSummary } from '../../typings/OrdertoReturn'
import { DEFAULT_SETTINGS } from '../clients/settings'

export const orderToReturnSummary = async (
  _: unknown,
  args: { orderId: string; storeUserEmail?: string },
  ctx: Context
): Promise<OrderToReturnSummary> => {
  const { orderId, storeUserEmail } = args
  const {
    state: { userProfile, appkey },
    clients: {
      returnSettings,
      oms,
      order: orderRequestClient,
      catalog,
      catalogGQL,
      account: accountClient,
      settingsAccount,
      profile,
    },
    vtex: { logger, adminUserAuthToken },
  } = ctx

  const accountInfo = await accountClient.getInfo()
  const appConfig = accountInfo?.parentAccountName
    ? DEFAULT_SETTINGS
    : await settingsAccount.getSettings(ctx)

  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName:
      accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig,
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured', 500)
  }

  if (!orderId) {
    throw new UserInputError('Order ID is missing')
  }

  const order = await oms.order(orderId)
  const { creationDate, clientProfileData, status } = order

  isUserAllowed({
    requesterUser: userProfile,
    clientProfile: clientProfileData,
    appkey,
  })
  canOrderBeReturned({
    creationDate,
    maxDays: settings.maxDays,
    status,
    orderStatus: settings.orderStatus,
  })

  if (userProfile?.role === 'admin') {
    try {
      const profileUnmask = await profile.getProfileUnmask(
        clientProfileData?.userProfileId,
        adminUserAuthToken,
        accountInfo?.parentAccountName || appConfig.parentAccountName
      )

      if (profileUnmask?.[0]?.document?.email) {
        const currentProfile = profileUnmask?.[0]?.document
        order.clientProfileData = {
          ...order.clientProfileData,
          email: currentProfile.email,
          firstName: currentProfile?.firstName,
          lastName: currentProfile?.lastName,
          phone: currentProfile?.homePhone,
        }
      } else {
        const response = await profile.searchEmailByUserId(
          clientProfileData?.userProfileId,
          adminUserAuthToken,
          accountInfo?.parentAccountName || appConfig.parentAccountName
        )

        if (response.length > 0) {
          const currentProfile = response?.[0]
          order.clientProfileData = {
            ...order.clientProfileData,
            email: currentProfile?.email,
            firstName: currentProfile?.email?.firstName,
            lastName: currentProfile?.email?.lastName,
            phone: currentProfile?.email?.phone,
          }
        }
      }
    } catch (error) {}

    try {
      const addressUnmask = await profile.getAddressUnmask(
        clientProfileData?.userProfileId,
        adminUserAuthToken,
        accountInfo?.parentAccountName || appConfig.parentAccountName
      )

      if (addressUnmask?.[0]?.document) {
        const address = addressUnmask?.[0]?.document
        order.shippingData.address = {
          ...order.shippingData.address,
          receiverName: address.receiverName,
          city: address.locality,
          postalCode: address.postalCode,
          street: address.route,
          number: address.streetNumber,
        }
      }
    } catch (error) {}
  }

  const customerEmail = getCustomerEmail(
    clientProfileData,
    {
      userProfile,
      appkey,
      inputEmail: storeUserEmail || clientProfileData?.email,
    },
    {
      logger,
    }
  )

  return createOrdersToReturnSummary(
    order,
    customerEmail,
    accountInfo?.parentAccountName
      ? { ...accountInfo, isSellerPortal: false }
      : {
          ...appConfig,
          isSellerPortal: true,
          accountName: accountInfo.accountName,
        },
    {
      excludedCategories: settings.excludedCategories,
      orderRequestClient,
      catalog,
      catalogGQL,
    }
  )
}
