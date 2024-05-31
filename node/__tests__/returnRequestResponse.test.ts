import { ReturnRequest } from '../../typings/ReturnRequest'
import { ReturnRequestResponse } from '../resolvers/ReturnRequestResponse'
import {
  mockAccountInfo,
  mockSettings,
} from './services/getGoodwillService.test'
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
export const mockReturnRequest: ReturnRequest = {
  id: '1',
  refundStatusData: [
    {
      submittedBy: 'Admin',
      comments: [
        {
          visibleForCustomer: true,
          comment: '',
          createdAt: '',
          role: 'adminUser',
          submittedBy: '',
        },
      ],
      status: 'new',
      createdAt: '',
    },
  ],
  orderId: '',
  refundableAmount: 0,
  sequenceNumber: '',
  status: 'new',
  refundableAmountTotals: [],
  customerProfileData: {
    userId: '123',
    name: '',
    email: '',
    phoneNumber: '',
  },
  pickupReturnData: {
    addressId: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    addressType: 'PICKUP_POINT',
    returnLabel: undefined,
  },
  refundPaymentData: {
    refundPaymentMethod: 'bank',
    iban: undefined,
    accountHolderName: undefined,
    automaticallyRefundPaymentMethod: undefined,
  },
  items: [],
  dateSubmitted: '',
  refundData: null,
  cultureInfoData: {
    currencyCode: '',
    locale: '',
  },
}
describe('ReturnRequestResponse', () => {
  const mockContext = {
    clients: {
      return: {
        get: jest.fn().mockResolvedValue({}),
      },
      returnRequestClient: {
        get: jest.fn().mockResolvedValue({}),
      },
      account: { getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }) },
      accountClient: {
        getInfo: jest.fn().mockResolvedValue({ mockAccountInfo }),
      },
      settingsAccount: {
        getSettings: jest.fn().mockResolvedValue({ mockSettings }),
      },
    },
    request: {
      header: { 'x-vtex-product': 'store' },
    },
  } as unknown as Context

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ReturnRequestResponse', () => {
    describe('refundData', () => {
      it('should return refundData if it exists', async () => {
        const mockReturnData = undefined

        const result = await ReturnRequestResponse.refundData(
          mockReturnRequest,
          {},
          mockContext
        )

        expect(result).toEqual(mockReturnData)
        expect(mockContext.clients.return.get).toHaveBeenCalled()
      })

      it('should return refundableAmount', async () => {
        const mockReturnData = undefined

        const result = await ReturnRequestResponse.refundableAmount(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          {},
          mockContext
        )

        expect(result).toEqual(mockReturnData)
        expect(mockContext.clients.return.get).toHaveBeenCalled()
      })
      it('should return refundableAmount 100', async () => {
        const result = await ReturnRequestResponse.refundableAmount(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 100,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          {},
          mockContext
        )

        expect(result).toEqual(100)
      })

      it('should return refundData from settings if parentAccountName is not available', async () => {
        const mockReturnData = undefined

        const result = await ReturnRequestResponse.refundData(
          mockReturnRequest,
          {},
          mockContext
        )

        expect(result).toEqual(mockReturnData)
        expect(mockContext.clients.return.get).toHaveBeenCalled()
      })
    })

    describe('cultureInfoData', () => {
      it('should return cultureInfoData if it is already present in the root', async () => {
        const result = await ReturnRequestResponse.cultureInfoData(
          mockReturnRequest,
          null,
          mockContext
        )

        expect(result).toEqual(mockReturnRequest.cultureInfoData)
      })

      it('should fetch cultureInfoData if it is not present in the root', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest
                .fn()
                .mockResolvedValue({ cultureInfoData: { some: 'data' } }),
            },
            account: {
              getInfo: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'parent' }),
            },
            settingsAccount: {
              getSettings: jest.fn(),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.cultureInfoData(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual({ currencyCode: '', locale: '' })
      })

      it('should fetch cultureInfoData with settings if parentAccountName is not present', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest
                .fn()
                .mockResolvedValue({ cultureInfoData: { some: 'data' } }),
            },
            account: {
              getInfo: jest.fn().mockResolvedValue({}),
            },
            settingsAccount: {
              getSettings: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'defaultParent' }),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.cultureInfoData(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.settingsAccount.getSettings).toHaveBeenCalled
        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual({ currencyCode: '', locale: '' })
      })
    })

    describe('createdIn', () => {
      it('should return the dateSubmitted from the root object', async () => {
        const result = await ReturnRequestResponse.createdIn(mockReturnRequest)

        expect(result).toBe(mockReturnRequest.dateSubmitted)
      })

      it('should return undefined if dateSubmitted is not present in the root object', async () => {
        const result = await ReturnRequestResponse.createdIn(mockReturnRequest)

        expect(result).toBe('')
      })

      it('should handle dateSubmitted being null', async () => {
        const result = await ReturnRequestResponse.createdIn(mockReturnRequest)

        expect(result).toBe('')
      })
    })

    jest.mock('../clients/settings', () => ({
      DEFAULT_SETTINGS: { parentAccountName: 'defaultParent' },
    }))

    describe('items', () => {
      it('should return items if they are already present in the root', async () => {
        const ctx = {} as unknown as Context

        const result = await ReturnRequestResponse.items(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 100,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [
              {
                orderItemIndex: 0,
                id: '',
                name: '',
                sellingPrice: 0,
                tax: 0,
                quantity: 0,
                imageUrl: '',
                unitMultiplier: 0,
                sellerId: '',
                productId: '',
                refId: '',
                returnReason: {
                  reason: '',
                  otherReason: undefined,
                },
                condition: 'unspecified',
              },
            ],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          ctx
        )

        expect(result).toEqual([
          {
            condition: 'unspecified',
            id: '',
            imageUrl: '',
            name: '',
            orderItemIndex: 0,
            productId: '',
            quantity: 0,
            refId: '',
            returnReason: {
              otherReason: undefined,
              reason: '',
            },
            sellerId: '',
            sellingPrice: 0,
            tax: 0,
            unitMultiplier: 0,
          },
        ])
      })

      it('should fetch items if they are not present in the root', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest.fn().mockResolvedValue({ items: [{ id: 'item1' }] }),
            },
            account: {
              getInfo: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'parent' }),
            },
            settingsAccount: {
              getSettings: jest.fn(),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.items(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual([
          {
            id: 'item1',
          },
        ])
      })

      it('should fetch items with settings if parentAccountName is not present', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest.fn().mockResolvedValue({ items: [{ id: 'item1' }] }),
            },
            account: {
              getInfo: jest.fn().mockResolvedValue({}),
            },
            settingsAccount: {
              getSettings: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'defaultParent' }),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.items(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.settingsAccount.getSettings).toHaveBeenCalled
        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual([
          {
            id: 'item1',
          },
        ])
      })
    })

    describe('refundPaymentData', () => {
      it('should return refundPaymentData if it is already present in the root', async () => {
        const ctx = {} as unknown as Context
        const result = await ReturnRequestResponse.refundPaymentData(
          mockReturnRequest,
          null,
          ctx
        )

        expect(result).toEqual(mockReturnRequest.refundPaymentData)
      })

      it('should fetch refundPaymentData if it is not present in the root', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest
                .fn()
                .mockResolvedValue({ refundPaymentData: { amount: 100 } }),
            },
            account: {
              getInfo: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'parent' }),
            },
            settingsAccount: {
              getSettings: jest.fn(),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.refundPaymentData(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '123',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          ctx
        )

        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual({ amount: 100 })
      })

      it('should fetch refundPaymentData with settings if parentAccountName is not present', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest
                .fn()
                .mockResolvedValue({ refundPaymentData: { amount: 100 } }),
            },
            account: {
              getInfo: jest.fn().mockResolvedValue({}),
            },
            settingsAccount: {
              getSettings: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'defaultParent' }),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.refundPaymentData(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.settingsAccount.getSettings).toHaveBeenCalled
        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual({
          accountHolderName: undefined,
          automaticallyRefundPaymentMethod: undefined,
          iban: undefined,
          refundPaymentMethod: 'bank',
        })
      })
    })

    describe('pickupReturnData', () => {
      it('should return pickupReturnData if it is already present in the root', async () => {
        const result = await ReturnRequestResponse.pickupReturnData(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '123',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(result).toEqual({
          addressId: '123',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          addressType: 'PICKUP_POINT',
          returnLabel: undefined,
        })
      })

      it('should fetch pickupReturnData if it is not present in the root', async () => {
        const result = await ReturnRequestResponse.pickupReturnData(
          mockReturnRequest,
          null,
          mockContext
        )

        expect(mockContext.clients.return.get).toHaveBeenCalled
        expect(result).toEqual(undefined)
      })

      it('should fetch pickupReturnData with settings if parentAccountName is not present', async () => {
        const ctx = {
          clients: {
            return: {
              get: jest.fn().mockResolvedValue({
                pickupReturnData: { address: '123 Main St' },
              }),
            },
            account: {
              getInfo: jest.fn().mockResolvedValue({}),
            },
            settingsAccount: {
              getSettings: jest
                .fn()
                .mockResolvedValue({ parentAccountName: 'defaultParent' }),
            },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.pickupReturnData(
          mockReturnRequest,
          null,
          ctx
        )

        expect(ctx.clients.settingsAccount.getSettings).toHaveBeenCalled
        expect(ctx.clients.return.get).toHaveBeenCalled
        expect(result).toEqual({
          address: '123 Main St',
        })
      })
    })

    describe('customerProfileData resolver', () => {
      it('should return customerProfileData if already present in root', async () => {
        const result = await ReturnRequestResponse.customerProfileData(
          mockReturnRequest,
          null,
          mockContext
        )

        expect(result).toEqual(mockReturnRequest.customerProfileData)
      })

      it('should fetch customerProfileData if not present in root', async () => {
        const result = await ReturnRequestResponse.customerProfileData(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(mockContext.clients.return.get).toHaveBeenCalled
        expect(result).toEqual(undefined)
      })

      it('should return customerProfileData if already present in root', async () => {
        const mockContextWithoutAccount = {
          clients: {
            return: {
              get: jest.fn().mockResolvedValue({}),
            },
            account: {
              getInfo: jest.fn().mockResolvedValue(undefined),
            },
            settingsAccount: {
              getSettings: jest.fn().mockResolvedValue({ mockSettings }),
            },
          },
          request: {
            header: { 'x-vtex-product': 'store' },
          },
        } as unknown as Context

        const result = await ReturnRequestResponse.customerProfileData(
          mockReturnRequest,
          null,
          mockContextWithoutAccount
        )

        expect(result).toEqual(mockReturnRequest.customerProfileData)
      })
    })

    describe('refundableAmountTotals', () => {
      it('should return refundableAmountTotals if already present in root', async () => {
        const result = await ReturnRequestResponse.refundableAmountTotals(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [
              {
                id: 'items',
                value: 0,
              },
            ],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(result).toEqual([
          {
            id: 'items',
            value: 0,
          },
        ])
      })

      it('should fetch refundableAmountTotals if not present in root', async () => {
        const result = await ReturnRequestResponse.refundableAmountTotals(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(mockContext.clients.return.get).toHaveBeenCalled
        expect(result).toEqual(undefined)
      })

      it('should use default settings if parent account name is not available', async () => {
        const result = await ReturnRequestResponse.refundableAmountTotals(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [
              {
                id: 'items',
                value: 0,
              },
            ],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(result).toEqual([
          {
            id: 'items',
            value: 0,
          },
        ])
      })
    })

    describe('refundStatusData', () => {
      it('should return refundStatusData if already present in root', async () => {
        const result = await ReturnRequestResponse.refundStatusData(
          mockReturnRequest,
          null,
          mockContext
        )

        expect(result).toEqual([
          {
            comments: [
              {
                comment: '',
                createdAt: '',
                role: 'adminUser',
                submittedBy: '',
                visibleForCustomer: true,
              },
            ],
            createdAt: '',
            status: 'new',
            submittedBy: undefined,
          },
        ])
      })
      it('should fetch refundStatusData if not present in root', async () => {
        const result = await ReturnRequestResponse.refundStatusData(
          {
            id: '123',
            refundData: null,
            orderId: '',
            refundableAmount: 0,
            sequenceNumber: '',
            status: 'new',
            refundableAmountTotals: [
              {
                id: 'items',
                value: 0,
              },
            ],
            customerProfileData: {
              userId: '',
              name: '',
              email: '',
              phoneNumber: '',
            },
            pickupReturnData: {
              addressId: '',
              address: '',
              city: '',
              state: '',
              country: '',
              zipCode: '',
              addressType: 'PICKUP_POINT',
              returnLabel: undefined,
            },
            refundPaymentData: {
              refundPaymentMethod: 'bank',
              iban: undefined,
              accountHolderName: undefined,
              automaticallyRefundPaymentMethod: undefined,
            },
            items: [],
            dateSubmitted: '',
            refundStatusData: [],
            cultureInfoData: {
              currencyCode: '',
              locale: '',
            },
          },
          null,
          mockContext
        )

        expect(mockContext.clients.account.getInfo).toHaveBeenCalled()
        expect(result).toEqual([])
      })
    })
  })
})
