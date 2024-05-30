import { ResolverError } from '@vtex/api'
import { ParamsUpdateReturnRequestStatus } from '../../../typings/ReturnRequest'
import { updateReturnRequestStatus } from '../../resolvers/updateReturnRequestStatus'
import { updateRequestStatusService } from '../../services/updateRequestStatusService'
import {
  mockAccountInfo,
  mockSettings,
} from '../services/getGoodwillService.test'

jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))

const mockParams: ParamsUpdateReturnRequestStatus = {
  requestId: 'request-123',
  status: 'amountRefunded',
}

describe('updateReturnRequestStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call updateRequestStatusService with correct arguments', async () => {
    const mockContext = {
      clients: {
        return: {
          updateReturn: jest.fn().mockResolvedValue(mockParams),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      request: {
        headers: {},
      },
    } as unknown as Context

    const mockReturnRequest = {
      id: 'request-123',
      requestId: 'request-123',
      status: 'amountRefunded',
    }
    jest.mock('../../services/updateRequestStatusService', () => ({
      updateRequestStatusService: jest
        .fn()
        .mockResolvedValue(mockReturnRequest),
    }))
    const result = await updateReturnRequestStatus(
      null,
      mockParams,
      mockContext
    )

    expect(updateRequestStatusService).toHaveBeenCalled
    expect(result).toEqual(mockReturnRequest)
  })

  it('should handle errors from updateRequestStatusService', async () => {
    const mockError = new ResolverError('Service error')
    const mockContext = {
      clients: {
        return: {
          updateReturn: jest.fn().mockResolvedValue(mockError),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: {
          getSettings: jest.fn().mockResolvedValue({ mockSettings }),
        },
      },
      request: {
        headers: {},
      },
    } as unknown as Context

    jest.mock('../../services/updateRequestStatusService', () => ({
      updateRequestStatusService: jest.fn().mockResolvedValue(mockError),
    }))
    const response = await updateReturnRequestStatus(
      null,
      mockParams,
      mockContext
    )
    expect(response).toStrictEqual({
      id: 'request-123',
      status: 500,
      code: 'RESOLVER_ERROR',
      name: 'ResolverError',
      level: 'error',
    })
  })
})
