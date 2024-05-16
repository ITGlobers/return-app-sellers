import type { OrderDetailResponse } from '@vtex/clients'

import type { Settings } from '../../clients/settings'
import { getErrorLog } from '../../typings/error'
import { getItemsIds, getItemsToInvoice } from '../../utils/getItemsIds'
import { ExternalLogSeverity } from '../../middlewares/errorHandler'

export const DEFAULT_SETTINGS = {
  parentAccountName: '',
  appKey: '',
  appToken: '',
}

const createInvoiceService = async (
  ctx: Context,
  invoiceSellerInput: any,
  orderId: string
) => {
  const {
    clients: { invoice, oms, account: accountClient, settingsAccount },
  } = ctx

  let appConfig: Settings = DEFAULT_SETTINGS
  const accountInfo = await accountClient.getInfo()
  if (!accountInfo?.parentAccountName) {
    appConfig = await settingsAccount.getSettings(ctx)
  }

  let order: OrderDetailResponse & { packageAttachment: any }

  try {
    order = await oms.getOrder(orderId)
  } catch (error) {
    ctx.status = 404
    throw new Error(getErrorLog('Order not found', 'INV000'))
  }

  const invoiceSeller = await getItemsToInvoice(invoiceSellerInput, order)
  if (invoiceSeller.type !== 'Input') {
    ctx.status = 400
    throw new Error(getErrorLog('Invoice type error', 'INV008'))
  }

  if (order?.packageAttachment?.packages?.length) {
    const itemsInoviced = order.packageAttachment.packages.flatMap(
      (pack: any) => pack.items
    )

    const itemNotAvailable = invoiceSeller.items.filter(
      (itemToInvoice: any) =>
        !itemsInoviced.some(
          (itemInvoiced: any) => itemInvoiced.id === itemToInvoice.id
        )
    )

    if (itemNotAvailable.length) {
      ctx.status = 400
      throw new Error(
        getErrorLog(
          `The following items with id: ${itemNotAvailable
            .map((item: any) => item.id)
            .join(', ')} are not available to be invoiced.`,
          'INV009'
        )
      )
    }
  }

  if (Number(invoiceSeller.invoiceValue) > order.value) {
    ctx.status = 400
    throw new Error(
      getErrorLog(
        'The invoice value cant be greater than order value',
        'INV010'
      )
    )
  }

  const invoiceMarketplace = await getItemsIds(ctx, invoiceSeller)

  invoiceMarketplace.seller = accountInfo.accountName
  const payload = {
    parentAccountName:
      accountInfo?.parentAccountName || appConfig?.parentAccountName,
    invoice: invoiceMarketplace,
    auth: appConfig,
    orderId,
  }

  ctx.state.logs.push({
    message: 'Request received',
    middleware: `Service create invoice Invoice from ${orderId}`,
    severity: ExternalLogSeverity.INFO,
    payload: {
      details: 'Body of the request captured',
      stack: JSON.stringify(invoiceMarketplace),
    },
  })

  const refundSummary = await invoice.createInvoiceSeller(payload)

  const response = await oms.createInvoice(orderId, refundSummary.invoiceSeller)

  return response
}

export default createInvoiceService
