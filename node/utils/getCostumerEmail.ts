import type { ClientProfileDetail } from '@vtex/clients'
import type { Logger } from '@vtex/api'
import { ResolverError } from '@vtex/api'

/**
 * Why not ALWAYS using email for userProfile?
 * userProfile is parsed from session cookie or created when a request is made using AuthCookie token.
 * When submitting a request via GraphQL IDE or calling the endpoint using APP-KEY and APP-TOKEN, we don't have the userProfile.
 * Also, we cannot use the email in the order because it might be masked.
 */
export const getCustomerEmail = (
  clientProfileData: ClientProfileDetail,
  {
    userProfile,
    appkey,
    inputEmail,
  }: {
    userProfile?: UserProfile
    appkey?: string
    /**
     * Email sent via args, either via GraphQL or request body in REST
     * @type {string}
     */
    inputEmail?: string | null
  },
  {
    logger,
  }: {
    logger: Logger
  }
): string => {
  if (userProfile) return inputEmail || userProfile.email

  logger.error({
    message: 'Could not parse store user email',
    params: {
      customerOrderId: clientProfileData.userProfileId,
      appkey,
      inputEmail,
      userProfile,
    },
  })

  throw new ResolverError('Missing costumer email', 400)
}
