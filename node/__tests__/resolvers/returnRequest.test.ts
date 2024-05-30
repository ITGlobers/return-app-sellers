import { returnRequest } from '../../resolvers/returnRequest'
import { returnRequestService } from '../../services/returnRequestService'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'
import { userProfile } from './orderToReturnSummary.test'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))

const mockArgs = {
  requestId: 'request-123',
}

describe('returnRequest resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call returnRequestService with correct arguments', async () => {
    const mockReturnRequest = { id: 'request-123', status: 'APPROVED' }
    jest.mock('../../services/returnRequestService', () => ({
      updateRequestStatusService: jest.fn().mockResolvedValue({}),
    }))
    const mockContext = {
      state: { userProfile, appkey: 'mockAppKey' },
      clients: {
        return: {
          getReturnById: jest.fn().mockResolvedValue(mockReturnRequest),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      request: {
        headers: {},
      },
    } as unknown as Context

    const result = await returnRequest(null, mockArgs, mockContext)

    expect(returnRequestService).toHaveBeenCalled
    expect(result).toEqual(mockReturnRequest)
  })

  it('should handle errors from returnRequestService', async () => {
    jest.mock('../../services/returnRequestService', () => ({
      updateRequestStatusService: jest.fn().mockResolvedValue({}),
    }))
    const mockContext = {
      state: { userProfile, appkey: 'mockAppKey' },
      clients: {
        return: {
          getReturnById: jest.fn().mockResolvedValue({}),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      header: {
        'x-vtex-product': 'store',
        vtexidclientautcookie: 'mock-cookie',
      },
      request: {
        headers: {},
      },
    } as unknown as Context
    const response = await returnRequest(null, mockArgs, mockContext)
    await expect(response).toStrictEqual({})
  })
})
