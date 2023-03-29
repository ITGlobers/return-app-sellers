import { ResolverError } from '@vtex/api'
import type { OrdersToReturnList, OrderToReturnSummary } from 'obidev.obi-return-app-sellers'

import { createOrdersToReturnSummary } from '../utils/createOrdersToReturnSummary'
import { getCurrentDate, substractDays } from '../utils/dateHelpers'

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
  filter
}: {
  maxDays: number
  page: number
  filter:any
}) => {
  const currentDate = getCurrentDate()
  const creationDate = filter?.createdIn ?  
  `creationDate:[${filter.createdIn.from} TO ${filter.createdIn.to}]` :  
  `creationDate:[${substractDays(
    currentDate,
    maxDays
  )} TO ${currentDate}]`

  return {
    q: filter?.orderId,
    orderBy: 'creationDate,desc' as const,
    f_status: 'invoiced' as const,
    f_creationDate: creationDate,
    page,
    per_page: 10 as const,
    
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
      catalogGQL,
      account: accountClient
    },
  } = ctx
  const { page, storeUserEmail , filter} = args

  const accountInfo = await accountClient.getInfo()  
  const settings = await returnSettings.getReturnSettings(accountInfo)

  if (!settings) {
    throw new ResolverError('Return App settings is not configured')
  }

  const { maxDays, excludedCategories } = settings
  const { email } = userProfile ?? {}

  const userEmail = storeUserEmail ?? email

  if (!userEmail) {
    throw new ResolverError('Missing user email', 400)
  }
 
  // Fetch order associated to the user email
  const { list, paging } = await oms.listOrdersWithParams(
    createParams({ maxDays, page , filter })
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
    const orderToReturnSummary = createOrdersToReturnSummary(order, userEmail, {
      excludedCategories,
      orderRequestClient,
      catalogGQL,
      accountClient
    })
    orderSummaryPromises.push(orderToReturnSummary)
  }

  const orderList = await Promise.all(orderSummaryPromises)

  return { list: orderList, paging }
}
