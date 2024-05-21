import { OrderDetailResponse } from '@vtex/clients'
import { getCustomerEmail } from '../../utils/getCostumerEmail'
import { createOrdersToReturnSummary } from '../../utils/createOrdersToReturnSummary'
import { ReturnAppSettings } from '../../../typings/ReturnAppSettings'
import { AccountInfo } from '../../clients/account'

const orderToReturnSummaryService = async (
  ctx: Context,
  order: OrderDetailResponse,
  accountInfo: AccountInfo,
  settings: ReturnAppSettings,
  appConfig: any,
  storeUserEmail?: string
) => {
  const {
    state: { userProfile, appkey },
    clients: { order: orderRequestClient, catalog, catalogGQL, profile },
    vtex: { logger, adminUserAuthToken },
  } = ctx
  const { clientProfileData } = order

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

export default orderToReturnSummaryService
