import { nearestPickupPoints } from '../../resolvers/nearestPickupPoints'

const mockCheckoutClient = {
  getNearestPickupPoints: jest.fn(),
}

const mockContext = {
  clients: {
    checkout: mockCheckoutClient,
  },
} as unknown as Context

describe('nearestPickupPoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return nearest pickup points', async () => {
    const lat = '123.456'
    const long = '-12.345'
    const mockNearestPickupPointsResponse = {}

    mockCheckoutClient.getNearestPickupPoints.mockResolvedValue(
      mockNearestPickupPointsResponse
    )

    const result = await nearestPickupPoints({}, { lat, long }, mockContext)

    expect(mockCheckoutClient.getNearestPickupPoints).toHaveBeenCalledWith(
      lat,
      long
    )

    expect(result).toEqual(mockNearestPickupPointsResponse)
  })
})
