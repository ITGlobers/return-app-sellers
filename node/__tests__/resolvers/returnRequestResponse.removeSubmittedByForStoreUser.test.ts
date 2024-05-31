import { ReturnRequest } from '../../../typings/ReturnRequest'
import {
  VtexProduct,
  removeSubmittedByForStoreUser,
} from '../../resolvers/ReturnRequestResponse'

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
      comment: 'This is a comment',
      createdAt: '2024-01-01T00:00:00Z',
      role: 'adminUser',
      submittedBy: 'adminUser1',
      visibleForCustomer: true,
    },
  ],
}

describe('removeSubmittedByForStoreUser', () => {
  it('should remove submittedBy for store user', () => {
    const vtexProduct: VtexProduct = 'store'
    const result = removeSubmittedByForStoreUser(mockStatusData, vtexProduct)
    expect(result).toEqual({
      ...mockStatusData,
      submittedBy: undefined,
    })
  })

  it('should not remove submittedBy for admin user', () => {
    const result = removeSubmittedByForStoreUser(mockStatusData, 'admin')
    expect(result).toEqual(mockStatusData)
  })

  it('should not remove submittedBy if vtexProduct is undefined', () => {
    const result = removeSubmittedByForStoreUser(mockStatusData, undefined)
    expect(result).toEqual(mockStatusData)
  })
})
