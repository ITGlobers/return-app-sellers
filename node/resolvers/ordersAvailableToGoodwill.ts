import { ResolverError } from '@vtex/api'

import type { OrdersToGoodwillList } from '../../typings/OrdertoReturn'
import { getCurrentDate, substractDays } from '../utils/dateHelpers'
import { STATUS_INVOICED, STATUS_PAYMENT_APPROVE } from '../utils/constants'
import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

const ONE_MINUTE = 60 * 1000

function pacer(callsPerMinute: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('done')
    }, ONE_MINUTE / callsPerMinute)
  })
}

const createParams = ({
  maxDays,
  page = 1,
  enableStatusSelection,
  filter,
  orderStatus = 'f_creationDate',
}: {
  maxDays: number
  page: number
  orderStatus?: string | any
  filter?: {
    orderId: string
    sellerName: string
    createdIn: { from: string; to: string }
  }
  enableStatusSelection: boolean | undefined | null
}) => {
  const currentDate = getCurrentDate()
  let creationDate = `creationDate:[${substractDays(
    currentDate,
    maxDays || 0
  )} TO ${currentDate}]`
  let orderIdFilter = ''
  if (filter) {
    const { createdIn, orderId } = filter
    orderIdFilter = orderId
    creationDate = createdIn
      ? `creationDate:[${createdIn.from} TO ${createdIn.to}]`
      : creationDate
  }

  if (orderStatus === 'partial-invoiced') {
    return {
      orderBy: 'creationDate,desc' as const,
      f_status: 'invoiced,payment-approved,handling',
      page,
      per_page: 10 as const,
      f_creationDate: creationDate,
      q: orderIdFilter,
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
    q: orderIdFilter,
  }
}

export const ordersAvailableToGoodwill = async (
  _: unknown,
  args: { page: number; storeUserEmail?: string; filter: any },
  ctx: Context
): Promise<OrdersToGoodwillList> => {
  const {
    state: { userProfile },
    clients: {
      returnSettings,
      oms,
      account: accountClient,
      settingsAccount,
      summary,
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

  const { maxDays, orderStatus, enableStatusSelection } = settings

  const { email } = userProfile ?? {}

  const userEmail = storeUserEmail ?? email

  if (!userEmail) {
    throw new ResolverError('Missing user email', 400)
  }

  // Fetch order associated to the user email
  const { list, paging } = await oms.listOrdersWithParams(
    createParams({ maxDays, page, filter, orderStatus, enableStatusSelection })
  )

  const orderListPromises = []

  for (const order of list) {
    // Fetch order details to get items and packages
    const orderId = order.orderId
    const orderPromise = oms.getOrderData(orderId)
    const orderToGoodwillList = {
      orderId: (await orderPromise).orderId,
      creationDate: (await orderPromise).creationDate,
      customer: `${(await orderPromise).clientProfileData.firstName} ${
        (await orderPromise).clientProfileData.lastName
      }`,
    }
    orderListPromises.push(orderToGoodwillList)

    // eslint-disable-next-line no-await-in-loop
    await pacer(2000)
  }
  const orders = await Promise.all(orderListPromises)
  const payload = {
    parentAccountName:
      accountInfo?.parentAccountName || appConfig?.parentAccountName,
    orders,
  }
  const response = await summary.getSummaryList(payload)

  return {
    list: response,
    paging: {
      ...paging,
      perPage: orders?.length || 0,
    },
  }
}
