import type { IOContext, InstanceOptions } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export class ProfileClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public searchEmailByUserId(
    userId: string,
    token: string | undefined,
    parentAccountName: string
  ) {
    if (!userId) return
    const URI = `https://${parentAccountName}.myvtex.com/api/dataentities/CL/search?userId=${userId}&_fields=email,firstName,lastName,phone`
    return this.http.get(URI, {
      metric: 'get-email-by-userId',
      headers: {
        VtexIdClientAutCookie: token,
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public getProfileUnmask(
    userId: string,
    token: string | undefined,
    parentAccountName: string
  ) {
    if (!userId) return
    const URI = `https://${parentAccountName}.myvtex.com/api/storage/profile-system/profiles/${userId}/unmask`
    return this.http.get(URI, {
      metric: 'get-profile-unmask',
      headers: {
        VtexIdClientAutCookie: token,
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public getAddressUnmask(
    userId: string,
    token: string | undefined,
    parentAccountName: string
  ) {
    if (!userId) return
    const URI = `https://${parentAccountName}.myvtex.com/api/storage/profile-system/profiles/${userId}/addresses/unmask`
    return this.http.get(URI, {
      metric: 'get-address-unmask',
      headers: {
        VtexIdClientAutCookie: token,
        'X-Vtex-Use-Https': 'true',
      },
    })
  }
}
