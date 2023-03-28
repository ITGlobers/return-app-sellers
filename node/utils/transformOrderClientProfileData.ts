import type { ClientProfileDetail } from '@vtex/clients'
import type { ClientProfileData } from 'vtexromania.obi-return-app-sellers'

export const transformOrderClientProfileData = (
  clientProfileData: ClientProfileDetail,
  email: string
): ClientProfileData => {
  return {
    name: `${clientProfileData.firstName} ${clientProfileData.lastName}`,
    email,
    phoneNumber: clientProfileData.phone,
  }
}
