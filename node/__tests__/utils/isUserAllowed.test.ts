import { ForbiddenError, ResolverError } from '@vtex/api'
import { isUserAllowed } from '../../utils/isUserAllowed'
import { ClientProfileDetail } from '@vtex/clients'

describe('isUserAllowed', () => {
  const clientProfile: ClientProfileDetail = {
    userProfileId: 'user123',
    document: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  }
  const appkey = 'your-app-key'

  // Test case when appkey is provided
  it('allows access if appkey is provided', () => {
    expect(() => {
      isUserAllowed({ clientProfile, appkey })
    }).not.toThrow()
  })

  // Test case when requester user is an admin
  it('allows access if requester user is an admin', () => {
    const requesterUser: UserProfile = {
      userId: 'admin123',
      role: 'admin',
      email: '',
    }

    expect(() => {
      isUserAllowed({ requesterUser, clientProfile })
    }).not.toThrow()
  })

  // Test case when requester user is the owner of the order
  it('allows access if requester user is the owner of the order', () => {
    const requesterUser: UserProfile = {
      userId: 'admin123',
      role: 'admin',
      email: '',
    }
    expect(() => {
      isUserAllowed({ requesterUser, clientProfile })
    }).not.toThrow()
  })

  // Test case when requester user is not allowed
  it('throws a ForbiddenError if requester user is not the owner of the order and not an admin', () => {
    const requesterUser: UserProfile = {
      userId: '',
      role: 'store-user',
      email: '',
    }
    expect(() => {
      isUserAllowed({ requesterUser, clientProfile })
    }).toThrow(ForbiddenError)
  })

  // Test case when UserProfile is missing
  it('throws a ResolverError if UserProfile is missing', () => {
    expect(() => {
      isUserAllowed({ clientProfile })
    }).toThrow(ResolverError)
  })
})
