import { DEFAULT_SETTINGS, Settings, SettingsClient } from '../clients/settings'

process.env.VTEX_APP_ID = 'vtex.my-app@1.x'

jest.mock('@vtex/api', () => ({
  ...jest.requireActual('@vtex/api'),
  appIdToAppAtMajor: jest.fn((appId) => `major/${appId}`),
}))

describe('SettingsClient', () => {
  let context: any
  let apps: { getAppSettings: jest.Mock }

  beforeEach(() => {
    apps = { getAppSettings: jest.fn() }
    context = { clients: { apps } } as unknown as Context
  })

  it('should return default settings if apps.getAppSettings returns undefined', async () => {
    apps.getAppSettings.mockResolvedValue(undefined)
    const settingsClient = new SettingsClient(context)
    const settings = await settingsClient.getSettings(context)

    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('should return merged settings if apps.getAppSettings returns partial settings', async () => {
    const partialSettings: Partial<Settings> = { appKey: 'test-key' }
    apps.getAppSettings.mockResolvedValue(partialSettings)
    const settingsClient = new SettingsClient(context)
    const settings = await settingsClient.getSettings(context)

    expect(settings).toEqual({ ...DEFAULT_SETTINGS, ...partialSettings })
  })

  it('should return app settings if apps.getAppSettings returns full settings', async () => {
    const appSettings: Settings = {
      parentAccountName: 'test-account',
      appKey: 'test-key',
      appToken: 'test-token',
    }
    apps.getAppSettings.mockResolvedValue(appSettings)
    const settingsClient = new SettingsClient(context)
    const settings = await settingsClient.getSettings(context)

    expect(settings).toEqual(appSettings)
  })
})
