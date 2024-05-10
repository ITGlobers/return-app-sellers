import { createReturnRequest } from './createReturnRequest'
import {
  queries as settingsQuery,
  mutations as settingsMutation,
} from './appSettings'
import { categoryTreeName } from './categoryTreeName'
import { ordersAvailableToReturn } from './ordersAvailableToReturn'
import { orderToReturnSummary } from './orderToReturnSummary'
import { ordersAvailableToGoodwill } from './ordersAvailableToGoodwill'
import { returnRequest } from './returnRequest'
import { returnRequestList } from './returnRequestList'
import { ReturnRequestResponse } from './ReturnRequestResponse'
import { updateReturnRequestStatus } from './updateReturnRequestStatus'
import { createGoodwillRequest } from './createGoodwillRequest'
import { createInvoiceRequest } from './createInvoiceRequest'
import { nearestPickupPoints } from './nearestPickupPoints'
import { orderSummary } from './orderSummary'

export const mutations = {
  createReturnRequest,
  updateReturnRequestStatus,
  createGoodwillRequest,
  createInvoiceRequest,
  ...settingsMutation,
}

export const queries = {
  ...settingsQuery,
  categoryTreeName,
  ordersAvailableToReturn,
  ordersAvailableToGoodwill,
  orderToReturnSummary,
  returnRequest,
  returnRequestList,
  nearestPickupPoints,
  orderSummary,
}

export const resolvers = { ReturnRequestResponse }
