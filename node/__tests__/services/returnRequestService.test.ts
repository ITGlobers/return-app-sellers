import { ResolverError } from '@vtex/api'
import { returnRequestService } from '../../services/returnRequestService'
import { mockAccountInfo, mockSettings } from './getGoodwillService.test'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
describe('returnRequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the return request when found', async () => {
    const mockContext = {
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue({
            list: [{ orderId: '1' }, { orderId: '2' }],
            paging: { total: 2, perPage: 10, page: 1 },
          }),
          getReturnById: jest.fn().mockResolvedValue({
            customerProfileData: { userId: 'user-456' },
          }),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      state: {
        userProfile: {
          userId: 'mockUserId',
          email: 'mockEmail',
          role: 'store-user',
        },
      },
      vtex: {
        logger: console,
      },
    } as unknown as Context
    const mockReturnRequest = {
      customerProfileData: { userId: 'user-456' },
    }

    const result = await returnRequestService(mockContext, 'request-123')

    expect(mockContext.clients.account.getInfo).toHaveBeenCalledWith(
      'mock-cookie'
    )
    expect(mockContext.clients.return.getReturnById).toHaveBeenCalled
    expect(result).toEqual(mockReturnRequest)
  })

  it('should throw ResolverError when return request is not found', async () => {
    const mockContext = {
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue({
            list: [{ orderId: '1' }, { orderId: '2' }],
            paging: { total: 2, perPage: 10, page: 1 },
          }),
          getReturnById: jest.fn().mockResolvedValue(undefined),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      state: {
        userProfile: {
          userId: 'mockUserId',
          email: 'mockEmail',
          role: 'store-user',
        },
      },
      vtex: {
        logger: console,
      },
    } as unknown as Context
    await expect(
      returnRequestService(mockContext, 'request-123')
    ).rejects.toThrow(ResolverError)
    await expect(
      returnRequestService(mockContext, 'request-123')
    ).rejects.toThrow('Request request-123 not found')
  })

  it('should throw ResolverError with correct code when return request is not found', async () => {
    const mockContext = {
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue({
            list: [{ orderId: '1' }, { orderId: '2' }],
            paging: { total: 2, perPage: 10, page: 1 },
          }),
          getReturnById: jest.fn(),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      state: {
        userProfile: {
          userId: 'mockUserId',
          email: 'mockEmail',
          role: 'store-user',
        },
      },
      vtex: {
        logger: console,
      },
    } as unknown as Context
    await expect(
      returnRequestService(mockContext, 'request-123')
    ).rejects.toThrow()
  })

  it('should not throw error if user is admin', async () => {
    const mockContext = {
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue({
            list: [{ orderId: '1' }, { orderId: '2' }],
            paging: { total: 2, perPage: 10, page: 1 },
          }),
          getReturnById: jest.fn().mockResolvedValue({
            customerProfileData: { userId: 'user-456' },
          }),
        },
        account: {
          getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
        },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      state: {
        userProfile: {
          userId: 'mockUserId',
          email: 'mockEmail',
          role: 'store-user',
        },
      },
      vtex: {
        logger: console,
      },
    } as unknown as Context
    const mockReturnRequest = {
      customerProfileData: { userId: 'user-456' },
    }
    const adminContext = {
      ...mockContext,
      state: {
        userProfile: { userId: 'admin-user', role: 'admin' },
        appkey: null,
      },
    } as unknown as Context

    const result = await returnRequestService(adminContext, 'request-123')

    expect(result).toEqual(mockReturnRequest)
  })
})
