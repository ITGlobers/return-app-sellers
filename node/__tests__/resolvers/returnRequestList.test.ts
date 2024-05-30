import { QueryReturnRequestListArgs } from '../../../typings/ReturnRequest'
import { returnRequestList } from '../../resolvers/returnRequestList'
import { returnRequestListService } from '../../services/returnRequestListService'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'
import { userProfile } from './orderToReturnSummary.test'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))

const mockArgs: QueryReturnRequestListArgs = {
  page: 0,
}

describe('returnRequest resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call returnRequestService with correct arguments', async () => {
    const mockReturnRequest = { id: 'request-123', status: 'APPROVED' }
    jest.mock('../../services/returnRequestListService', () => ({
      updateRequestStatusService: jest.fn().mockResolvedValue({}),
    }))
    const mockContext = {
      state: { userProfile, appkey: 'mockAppKey' },
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue(mockReturnRequest),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      request: {
        header: {
          'x-vtex-product': 'store',
        },
      },
      header: {
        vtexidclientautcookie: 'mock-cookie',
      },
    } as unknown as Context

    const result = await returnRequestList(null, mockArgs, mockContext)

    expect(returnRequestListService).toHaveBeenCalled
    expect(result).toEqual({ list: undefined, paging: undefined })
  })

  it('should handle errors from returnRequestService', async () => {
    jest.mock('../../services/returnRequestListService', () => ({
      updateRequestStatusService: jest.fn().mockResolvedValue({}),
    }))
    const mockContext = {
      state: { userProfile, appkey: 'mockAppKey' },
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue(new Error()),
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
        header: { 'x-vtex-product': 'store' },
      },
    } as unknown as Context
    const response = await returnRequestList(null, mockArgs, mockContext)
    await expect(response).toStrictEqual({
      list: undefined,
      paging: undefined,
    })
  })
})
