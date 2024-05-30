import { queries, mutations } from '../../resolvers/index'
import { DEFAULT_SETTINGS } from '../../clients/settings'
import { MutationSaveReturnAppSettingsArgs } from '../../../typings/ReturnAppSettings'
import {
  validateMaxDaysCustomReasons,
  validatePaymentOptions,
  valideteUniqueCustomReasonsPerLocale,
} from '../../utils/appSettingsValidation'
import {
  mockSettings,
  mockAccountInfo,
} from '../services/getGoodwillService.test'

jest.mock('../../utils/appSettingsValidation')
jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))
const args: MutationSaveReturnAppSettingsArgs = {
  settings: {
    maxDays: 30,
    enableStatusSelection: true,
    excludedCategories: [],
    paymentOptions: {
      enablePaymentMethodSelection: true,
      allowedPaymentTypes: { bank: true },
      automaticallyRefundPaymentMethod: true,
    },
    termsUrl: 'String',
    customReturnReasons: [],
    options: {},
    orderStatus: 'String',
  },
}
const mockGetInfo = jest.fn()
const mockGetSettings = jest.fn()
const mockGetReturnSettingsMket = jest.fn()
const mockSaveReturnSettings = jest.fn()
const createContext = (): Context =>
  ({
    clients: {
      returnSettings: {
        getReturnSettingsMket: mockGetReturnSettingsMket,
        saveReturnSettings: mockSaveReturnSettings,
      },
      account: {
        getInfo: mockGetInfo,
      },
      settingsAccount: {
        getSettings: mockGetSettings,
      },
    },
    state: {
      logs: [],
    },
  } as unknown as Context)

describe('returnAppSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null if settings are not found', async () => {
    const ctx = createContext()
    mockGetInfo.mockResolvedValue({
      accountName: 'test-account',
      parentAccountName: mockSettings.parentAccountName,
    })
    mockGetReturnSettingsMket.mockResolvedValue(null)

    const result = await queries.returnAppSettings({}, {}, ctx)
    expect(result).toBeNull()
  })

  it('should return settings if found', async () => {
    const ctx = createContext()
    const settings = { some: 'settings' }
    mockGetInfo.mockResolvedValue({
      accountName: 'test-account',
      parentAccountName: mockSettings.parentAccountName,
    })
    mockGetSettings.mockResolvedValue(DEFAULT_SETTINGS)
    mockGetReturnSettingsMket.mockResolvedValue(settings)

    const result = await queries.returnAppSettings({}, {}, ctx)
    expect(result).toEqual(settings)
  })
})

describe('saveReturnAppSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate and save return app settings', async () => {
    const ctx = createContext()

    mockGetInfo.mockResolvedValue(mockAccountInfo)
    mockGetSettings.mockResolvedValue(mockSettings)
    mockSaveReturnSettings.mockResolvedValue(args)
    await mutations.saveReturnAppSettings({}, args, ctx)

    expect(validateMaxDaysCustomReasons).toHaveBeenCalledWith(
      args.settings.maxDays,
      args.settings.customReturnReasons
    )
    expect(valideteUniqueCustomReasonsPerLocale).toHaveBeenCalledWith(
      args.settings.customReturnReasons
    )
    expect(validatePaymentOptions).toHaveBeenCalledWith(
      args.settings.paymentOptions
    )
    expect(mockSaveReturnSettings).toHaveBeenCalledWith({
      parentAccountName: mockSettings.parentAccountName,
      settings: {
        settings: {
          sellerId: mockAccountInfo.accountName,
          parentAccount: mockSettings.parentAccountName,
          ...args.settings,
          paymentOptions: undefined,
        },
      },
      auth: DEFAULT_SETTINGS,
    })
  })

  it('should save settings with parent account name from account info', async () => {
    const ctx = createContext()

    mockGetInfo.mockResolvedValue(mockAccountInfo)

    await mutations.saveReturnAppSettings({}, args, ctx)

    expect(mockSaveReturnSettings).toHaveBeenCalledWith({
      parentAccountName: mockSettings.parentAccountName,
      settings: {
        settings: {
          sellerId: mockAccountInfo.accountName,
          parentAccount: mockSettings.parentAccountName,
          ...args.settings,
          paymentOptions: undefined,
        },
      },
      auth: DEFAULT_SETTINGS,
    })
  })
})
