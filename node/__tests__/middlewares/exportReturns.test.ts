import { exportReturns } from '../../middlewares/exportReturns'

const mockContext = {
  query: {
    dateSubmitted: '2022-05-20',
  },
  clients: {
    return: {
      exportReturn: jest.fn().mockResolvedValue({ data: [] }),
    },
    account: {
      getInfo: jest
        .fn()
        .mockResolvedValue({ parentAccountName: 'mockParentAccountName' }),
    },
    settingsAccount: {
      getSettings: jest
        .fn()
        .mockResolvedValue({ parentAccountName: 'mockParentAccountName' }),
    },
  },
  status: 200,
  body: {},
  set: jest.fn(),
} as unknown as Context

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

describe('exportReturns', () => {
  it('should export return requests successfully', async () => {
    const mockNext = jest.fn()

    await expect(
      exportReturns(mockContext as any, mockNext)
    ).resolves.toBeUndefined()

    expect(mockContext.clients.return.exportReturn).toHaveBeenCalledWith({
      dateSubmitted: '2022-05-20',
      parentAccountName: 'mockParentAccountName',
    })
    expect(mockContext.status).toBe(200)
    expect(mockContext.set).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    expect(mockContext.set).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('return-requests-')
    )
  })

  it('should handle missing dateSubmitted query parameter', async () => {
    const mockNext = jest.fn()
    mockContext.query.dateSubmitted = ''

    await expect(exportReturns(mockContext as any, mockNext)).rejects.toThrow(
      "The 'dateSubmitted' query parameter is required"
    )
    expect(mockNext).not.toHaveBeenCalled()
  })
})
