import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export class ProfileClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public searchEmailByUserId(userId: string, token: string | undefined, parentAccountName: string) {
    return this.http.get(`https://${parentAccountName}.myvtex.com/api/dataentities/CL/search?userId=${userId}&_fields=email,firstName,lastName,phone`, {
      metric: 'get-email-by-userId',
      headers: {
        VtexIdClientAutCookie: token,
      }
    })
  }

  public getProfileUnmask(userId: string, token: string | undefined, parentAccountName: string) {
    return this.http.get(`https://${parentAccountName}.myvtex.com/api/storage/profile-system/profiles/${userId}/unmask`, {
      metric: 'get-profile-unmask',
      headers: {
        VtexIdClientAutCookie: token,
      }
    })
  }


  public getAddressUnmask(userId: string, token: string | undefined, parentAccountName: string) {
    return this.http.get(`https://${parentAccountName}.myvtex.com/api/storage/profile-system/profiles/${userId}/addresses/unmask`, {
      metric: 'get-address-unmask',
      headers: {
        VtexIdClientAutCookie: token,
      }
    })
  }
  
}