import { ResolverError, UserInputError } from '@vtex/api'
import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { isUserAllowed } from '../utils/isUserAllowed'
import { canOrderBeReturned } from '../utils/canOrderBeReturned'
import { getCustomerEmail } from '../utils/getCostumerEmail'
import type { OrderToReturnSummary } from '../../typings/OrdertoReturn'
import { DEFAULT_SETTINGS } from '../clients/settings'
import { ProfileClient } from '../clients/profile'
import { ClientProfileDetail } from '@vtex/clients'

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

  const parentAccountName =
    accountInfo?.parentAccountName || appConfig.parentAccountName
  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName,
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
      const currentProfile = await fetchProfileData(
        profile,
        clientProfileData,
        parentAccountName,
        adminUserAuthToken
      )
      if (currentProfile) {
        order.clientProfileData = {
          ...order.clientProfileData,
          email: currentProfile.email,
          firstName: currentProfile.firstName,
          lastName: currentProfile.lastName,
          phone: currentProfile.homePhone,
        }
      }
    } catch (error) {
      logger.error('Error fetching profile data')
    }

    try {
      const address = await fetchAddressData(
        profile,
        clientProfileData,
        parentAccountName,
        adminUserAuthToken
      )
      if (address) {
        order.shippingData.address = {
          ...order.shippingData.address,
          receiverName: address.receiverName,
          city: address.locality,
          postalCode: address.postalCode,
          street: address.route,
          number: address.streetNumber,
        }
      }
    } catch (error) {
      logger.error('Error fetching address data')
    }
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

const fetchProfileData = async (
  profile: ProfileClient,
  clientProfileData: ClientProfileDetail,
  accountName: string,
  adminUserAuthToken?: string
) => {
  const profileUnmask = await profile.getProfileUnmask(
    clientProfileData?.userProfileId,
    adminUserAuthToken,
    accountName
  )
  if (profileUnmask?.[0]?.document?.email) {
    return profileUnmask[0].document
  }
  const response = await profile.searchEmailByUserId(
    clientProfileData?.userProfileId,
    adminUserAuthToken,
    accountName
  )
  if (response.length > 0) {
    return response?.[0]
  }
}

const fetchAddressData = async (
  profile: ProfileClient,
  clientProfileData: ClientProfileDetail,
  accountName: string,
  adminUserAuthToken?: string
) => {
  const addressUnmask = await profile.getAddressUnmask(
    clientProfileData?.userProfileId,
    adminUserAuthToken,
    accountName
  )
  if (addressUnmask?.[0]?.document) {
    return addressUnmask[0].document
  }
  return null
}
