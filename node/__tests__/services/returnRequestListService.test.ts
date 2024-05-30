import { returnRequestListService } from '../../services/returnRequestListService'
import { mockAccountInfo } from './getGoodwillService.test'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
describe('returnRequestListService', () => {
  it('should return list and paging objects', async () => {
    const mockContext = {
      clients: {
        return: {
          getReturnList: jest.fn().mockResolvedValue({
            list: [{ orderId: '1' }, { orderId: '2' }],
            paging: { total: 2, perPage: 10, page: 1 },
          }),
        },
        account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
        settingsAccount: { getSettings: jest.fn() },
      },
      request: {
        header: {
          'x-vtex-product': 'store',
        },
      },
      state: {
        userProfile: {
          userId: 'mockUserId',
          email: 'mockEmail',
          role: 'store-user',
        },
      },
    } as unknown as Context

    const mockArgs = {
      page: 1,
      perPage: 10,
      filter: {
        sequenceNumber: '123',
        id: '456',
        orderId: '789',
        userEmail: 'mockUserEmail',
        createdIn: { from: '2022-01-01', to: '2022-12-31' },
      },
    }

    const result = await returnRequestListService(mockContext, mockArgs)

    expect(mockContext.clients.return.getReturnList).toHaveBeenCalled

    expect(result).toHaveProperty('list')
    expect(result).toHaveProperty('paging')
  })
})
