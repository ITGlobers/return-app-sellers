import { auth } from '../../middlewares/auth'

const mockContext = {
  header: {},
  clients: { vtexId: {}, sphinx: {} },
  state: {},
  status: 200,
  vtex: {},
} as unknown as Context

const mockNext = jest.fn()

describe('auth function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set userProfile and adminUserAuthToken when authCookie is provided', async () => {
    const authenticatedUser = {
      user: 'test@example.com',
      userId: '123',
    }

    mockContext.clients.vtexId.getAuthenticatedUser = jest
      .fn()
      .mockResolvedValue(authenticatedUser)

    mockContext.clients.sphinx.isAdmin = jest.fn().mockResolvedValue(true)

    mockContext.header.vtexidclientautcookie = 'testAuthCookie'

    await auth(mockContext as any, mockNext)

    expect(mockContext.state.userProfile).toEqual({
      userId: '123',
      email: 'test@example.com',
      role: 'admin',
    })
    expect(mockContext.vtex.adminUserAuthToken).toBe('testAuthCookie')
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('should set appkey and adminUserAuthToken when appkey and apptoken are provided', async () => {
    const tokenResponse = { token: 'testToken' }

    mockContext.clients.vtexId.login = jest
      .fn()
      .mockResolvedValue(tokenResponse)

    mockContext.header['x-vtex-api-appkey'] = 'testAppKey'
    mockContext.header['x-vtex-api-apptoken'] = 'testAppToken'

    await auth(mockContext as any, mockNext)

    expect(mockContext.state.appkey).toBe('testAppKey')
    expect(mockContext.vtex.adminUserAuthToken).toBe('testToken')
    expect(mockNext).toHaveBeenCalledTimes(1)
  })
})
