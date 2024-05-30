import { ClientProfileDetail } from '@vtex/clients'
import { getCustomerEmail } from '../../utils/getCostumerEmail'
import { ResolverError } from '@vtex/api'

describe('getCustomerEmail', () => {
  let ctx: any

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = {
      state: {
        logs: [],
      },
      vtex: {
        logger: {
          error: jest.fn().mockResolvedValue({}),
        },
      },
    } as unknown as Context
  })

  const mockClientProfileData: ClientProfileDetail = {
    userProfileId: '123',
    document: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return inputEmail if userProfile is provided', () => {
    const userProfile: UserProfile = {
      email: 'user@example.com',
      userId: '',
      role: 'admin',
    }
    const inputEmail = 'input@example.com'

    const email = getCustomerEmail(
      mockClientProfileData,
      { userProfile, inputEmail },
      { logger: ctx.vtex.logger }
    )

    expect(email).toBe(inputEmail)
  })

  it('should return userProfile.email if inputEmail is not provided', () => {
    const userProfile: UserProfile = {
      email: 'user@example.com',
      userId: '',
      role: 'admin',
    }
    const email = getCustomerEmail(
      mockClientProfileData,
      { userProfile },
      { logger: ctx.vtex.logger }
    )

    expect(email).toBe(userProfile.email)
  })

  it('should log an error and throw ResolverError if userProfile is not provided', () => {
    expect(() => {
      getCustomerEmail(mockClientProfileData, {}, { logger: ctx.vtex.logger })
    }).toThrow(ResolverError)

    expect(ctx.vtex.logger).toBeCalled
  })

  it('should log an error and throw ResolverError with appkey', () => {
    const appkey = 'someAppKey'

    expect(() => {
      getCustomerEmail(
        mockClientProfileData,
        { appkey },
        { logger: ctx.vtex.logger }
      )
    }).toThrow(ResolverError)

    expect(ctx.vtex.logger).toBeCalled
  })
})
