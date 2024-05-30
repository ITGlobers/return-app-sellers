import { ReturnRequest } from '../../../typings/ReturnRequest'
import { transformStatusForStoreUser } from '../../resolvers/ReturnRequestResponse'
jest.mock('@vtex/api', () => {
  const originalModule = jest.requireActual('@vtex/api')

  return {
    ...originalModule,
    appIdToAppAtMajor: jest.fn(),
    ExternalClient: jest.fn(() => ({
      constructor: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    })),
  }
})
const mockStatusData: ReturnRequest['refundStatusData'][number] = {
  status: 'new',
  submittedBy: 'adminUser1',
  createdAt: '2024-01-01T00:00:00Z',
  comments: [
    {
      comment: 'Visible comment',
      createdAt: '2024-01-01T00:00:00Z',
      role: 'adminUser',
      submittedBy: 'adminUser1',
      visibleForCustomer: true,
    },
    {
      comment: 'Hidden comment',
      createdAt: '2024-01-01T00:00:00Z',
      role: 'adminUser',
      submittedBy: 'adminUser1',
      visibleForCustomer: false,
    },
  ],
}

const mockRefundStatusDataList: ReturnRequest['refundStatusData'] = [
  mockStatusData,
]

describe('transformStatusForStoreUser', () => {
  it('should transform status data for store user', () => {
    const result = transformStatusForStoreUser(
      mockRefundStatusDataList,
      'store'
    )
    expect(result).toEqual([
      {
        ...mockStatusData,
        submittedBy: undefined,
        comments: [
          {
            comment: 'Visible comment',
            createdAt: '2024-01-01T00:00:00Z',
            role: 'adminUser',
            submittedBy: 'adminUser1',
            visibleForCustomer: true,
          },
        ],
      },
    ])
  })

  it('should not transform status data for admin user', () => {
    const result = transformStatusForStoreUser(
      mockRefundStatusDataList,
      'admin'
    )
    expect(result).toEqual(mockRefundStatusDataList)
  })

  it('should not transform status data if vtexProduct is undefined', () => {
    const result = transformStatusForStoreUser(
      mockRefundStatusDataList,
      undefined
    )
    expect(result).toEqual(mockRefundStatusDataList)
  })
})
