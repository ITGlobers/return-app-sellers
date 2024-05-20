import { ResolverError } from '@vtex/api'
import type {
  OrdersToReturnList,
  OrderToReturnSummary,
} from '../../typings/OrdertoReturn'
import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { getCurrentDate, substractDays } from '../utils/dateHelpers'
import { STATUS_INVOICED, STATUS_PAYMENT_APPROVE } from '../utils/constants'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

const ONE_MINUTE = 60 * 1000

async function pacer(callsPerMinute: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ONE_MINUTE / callsPerMinute)
  })
}

function createParams({
  maxDays,
  page = 1,
  enableStatusSelection,
  filter,
  orderStatus = 'f_creationDate',
}: {
  maxDays: number
  page: number
  orderStatus?: string
  filter?: {
    orderId: string
    sellerName: string
    createdIn: { from: string; to: string }
  }
  enableStatusSelection: boolean | undefined | null
}) {
  let query = ''
  const currentDate = getCurrentDate()
  const creationDate = `creationDate:[${substractDays(
    currentDate,
    maxDays || 0
  )} TO ${currentDate}]`

  if (filter) {
    const { createdIn, orderId } = filter
    query = orderId || ''
    return createdIn
      ? {
          orderBy: 'creationDate,desc' as const,
          f_status: enableStatusSelection
            ? STATUS_INVOICED
            : `${STATUS_INVOICED},${STATUS_PAYMENT_APPROVE}`,
          f_creationDate: `creationDate:[${createdIn.from} TO ${createdIn.to}]`,
          page,
          per_page: 10 as const,
          q: query,
        }
      : {
          orderBy: 'creationDate,desc' as const,
          f_status: enableStatusSelection
            ? STATUS_INVOICED
            : `${STATUS_INVOICED},${STATUS_PAYMENT_APPROVE}`,
          f_creationDate: creationDate,
          page,
          per_page: 10 as const,
          q: query,
        }
  }

  return {
    orderBy: 'creationDate,desc' as const,
    f_status: enableStatusSelection
      ? STATUS_INVOICED
      : `${STATUS_INVOICED},${STATUS_PAYMENT_APPROVE}`,
    [orderStatus]: creationDate,
    page,
    per_page: 10 as const,
    f_creationDate: creationDate,
    q: query,
  }
}

export const ordersAvailableToReturn = async (
  _: unknown,
  args: { page: number; storeUserEmail?: string; filter: any },
  ctx: Context
): Promise<OrdersToReturnList> => {
  const {
    state: { userProfile },
    clients: {
      returnSettings,
      oms,
      order: orderRequestClient,
      catalog,
      catalogGQL,
      account: accountClient,
      settingsAccount,
    },
  } = ctx

  const { page, storeUserEmail, filter } = args

  const accountInfo = await accountClient.getInfo()
  let appConfig: Settings = DEFAULT_SETTINGS

  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName:
      accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig,
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured')
  }

  const { maxDays, excludedCategories, orderStatus, enableStatusSelection } =
    settings

  const { email } = userProfile ?? {}
  const userEmail = storeUserEmail ?? email

  if (!userEmail) {
    throw new ResolverError('Missing user email', 400)
  }

  // Fetch orders associated with the user email
  const { list, paging } = await oms.listOrdersWithParams(
    createParams({ maxDays, page, filter, orderStatus, enableStatusSelection })
  )

  const orderListPromises: Promise<any>[] = list.map(async (order) => {
    await pacer(2000)
    return oms.order(order.orderId)
  })

  const orders = await Promise.all(orderListPromises)

  const orderSummaryPromises: Promise<OrderToReturnSummary>[] = orders.map(
    (order) =>
      createOrdersToReturnSummary(
        order,
        userEmail,
        accountInfo?.parentAccountName
          ? { ...accountInfo, isSellerPortal: false }
          : {
              ...appConfig,
              isSellerPortal: true,
              accountName: accountInfo.accountName,
            },
        {
          excludedCategories,
          orderRequestClient,
          catalog,
          catalogGQL,
        }
      )
  )

  const orderList = await Promise.all(orderSummaryPromises)

  return {
    list: orderList,
    paging: {
      ...paging,
      perPage: orderList.length || 0,
    },
  }
}
