import type { ClientProfileDetail } from '@vtex/clients'
import { ClientProfileData } from '../../typings/OrdertoReturn'

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
