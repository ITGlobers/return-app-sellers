import { ResolverError } from '@vtex/api'
import {OrdersToReturnList, OrderToReturnSummary} from "../../typings/OrdertoReturn"
import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
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
  },
  enableStatusSelection : boolean | undefined | null
}) => {
  const currentDate = getCurrentDate()
  const orderStatusName = orderStatus?.replace('f_','')
  
  let creationDate = `${orderStatusName}:[${substractDays(
    currentDate,
    maxDays || 0
    )} TO ${currentDate}]`

  if (filter) {
    const { createdIn } = filter
    creationDate = createdIn
      ? `${orderStatusName}:[${createdIn.from} TO ${createdIn.to}]`
      : creationDate
  }

  return {
    orderBy: 'creationDate,desc' as const,
    f_status: enableStatusSelection ? STATUS_INVOICED : `${STATUS_INVOICED},${STATUS_PAYMENT_APPROVE}`,
    [orderStatus]: creationDate,
    page,
    per_page: 10 as const
  }
}

export const ordersAvailableToReturn = async (
  _: unknown,
  args: { page: number; storeUserEmail?: string , filter : any},
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
  const { page, storeUserEmail , filter} = args

  const accountInfo = await accountClient.getInfo()

  let appConfig: Settings = DEFAULT_SETTINGS
  if(!accountInfo?.parentAccountName){
    appConfig = await settingsAccount.getSettings(ctx)
  }
  
  const settings = await returnSettings.getReturnSettingsMket({
    parentAccountName: accountInfo?.parentAccountName || appConfig.parentAccountName,
    auth: appConfig
  })

  if (!settings) {
    throw new ResolverError('Return App settings is not configured')
  }
  
  const { maxDays, excludedCategories, orderStatus, enableStatusSelection } = settings
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
    const orderPromise = oms.order(order.orderId)

    orderListPromises.push(orderPromise)

    // eslint-disable-next-line no-await-in-loop
    await pacer(2000)
  }

  const orders = await Promise.all(orderListPromises)

  const orderSummaryPromises: Array<Promise<OrderToReturnSummary>> = []
  
  for (const order of orders) {
    const orderToReturnSummary = createOrdersToReturnSummary(
      order,
      userEmail,
      accountInfo?.parentAccountName ? {...accountInfo, isSellerPortal: false} : {...appConfig, isSellerPortal: true, accountName: accountInfo.accountName} , 
      {
        excludedCategories,
        orderRequestClient,
        catalog,
        catalogGQL,
      }
    )
    orderSummaryPromises.push(orderToReturnSummary)
  }

  const orderList = await Promise.all(orderSummaryPromises)

  return { list: orderList, paging }
}
