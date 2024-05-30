import { AccountInfo } from '../../clients/account'
import { Settings } from '../../clients/settings'
import getGoodwillService from '../../services/goodwill/getGoodwillService'
export const mockSettings: Settings = {
  parentAccountName: 'mockParentAccount',
  appKey: 'mockAppKey',
  appToken: 'mockAppToken',
}
export const mockAccountInfo: AccountInfo = {
  isActive: true,
  id: 'mockId',
  name: 'Mock Account',
  accountName: 'mock_account',
  lv: null,
  isOperating: true,
  defaultUrl: null,
  district: null,
  country: null,
  complement: null,
  companyName: 'Mock Company',
  cnpj: null,
  haveParentAccount: true,
  parentAccountId: 'mockParentAccountId',
  parentAccountName: 'mockParentAccount',
  city: null,
  address: null,
  logo: null,
  hasLogo: false,
  number: null,
  postalCode: null,
  state: null,
  telephone: '1234567890',
  tradingName: 'Mock Trading Name',
}

const mockCtx = {
  clients: {
    goodwill: {
      getGoodwillSeller: jest.fn().mockResolvedValue({}),
    },
    account: {
      getInfo: jest.fn().mockResolvedValue({
        mockAccountInfo,
      }),
    },
    settingsAccount: {
      getSettings: jest.fn().mockResolvedValue({
        mockSettings,
      }),
    },
  },
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

describe('getGoodwillService', () => {
  it('should call getGoodwillSeller with correct payload', async () => {
    const id = 'mockedId'

    await getGoodwillService(mockCtx, id)

    expect(mockCtx.clients.account.getInfo).toHaveBeenCalled()
    expect(mockCtx.clients.settingsAccount.getSettings).toHaveBeenCalled()

    expect(mockCtx.clients.goodwill.getGoodwillSeller).toHaveBeenCalledWith({
      auth: {
        mockSettings: {
          appKey: 'mockAppKey',
          appToken: 'mockAppToken',
          parentAccountName: 'mockParentAccount',
        },
      },
      id: 'mockedId',
      parentAccountName: undefined,
      sellerID: undefined,
    })
  })

  it('should call getGoodwillSeller without ID', async () => {
    await getGoodwillService(mockCtx)

    expect(mockCtx.clients.account.getInfo).toHaveBeenCalled()
    expect(mockCtx.clients.settingsAccount.getSettings).toHaveBeenCalled()

    expect(mockCtx.clients.goodwill.getGoodwillSeller).toHaveBeenCalledWith({
      auth: {
        mockSettings: {
          appKey: 'mockAppKey',
          appToken: 'mockAppToken',
          parentAccountName: 'mockParentAccount',
        },
      },
      id: 'mockedId',
      parentAccountName: undefined,
      sellerID: undefined,
    })
  })
})
