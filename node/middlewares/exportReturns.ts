import XLSX from 'xlsx'

import type { Settings } from '../clients/settings'
import { DEFAULT_SETTINGS } from '../clients/settings'

const createXLSBuffer = (data: any[]) => {
  const flattenedData = data.map((item: any) => ({
    'Return Request ID': item?.id,
    'Order ID': item?.orderId,
    'Return Request Status': item?.status,
    'Return Reason': item?.items
      ?.map((reason: any) => `${reason?.id}-${reason?.returnReason?.reason}`)
      .join(','),
    'Customer Name': item?.customerProfileData?.name,
    'Customer Email': item?.customerProfileData?.email,
    'Seller Name': item?.sellerName || '',
    Carrier: item?.logisticsInfo?.currier || '',
    'Shipping method': item?.logisticsInfo?.sla || '',
    'Sequence Number': item?.sequenceNumber,
    'Creation date': item?.createdIn,
    'Creation time': item?.dateSubmitted,
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(flattenedData)

  XLSX.utils.book_append_sheet(workbook, worksheet, 'return-requests')

  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
}

export async function exportReturns(ctx: Context, next: () => Promise<void>) {
  const {
    query,
    clients: { return: returnClient, account: accountClient, settingsAccount },
  } = ctx

  const { dateSubmitted } = query as { dateSubmitted: string }

  if (!dateSubmitted) {
    throw new Error("The 'dateSubmitted' query parameter is required")
  }

  try {
    const accountInfo = await accountClient.getInfo()

    let appConfig: Settings = DEFAULT_SETTINGS

    if (!appConfig?.parentAccountName) {
      appConfig = await settingsAccount.getSettings(ctx)
    }

    const responseRequests = await returnClient.exportReturn({
      dateSubmitted,
      parentAccountName:
        accountInfo?.parentAccountName ?? appConfig?.parentAccountName,
    })

    const file = createXLSBuffer(responseRequests.data)

    ctx.body = file
    ctx.status = 200
    ctx.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    ctx.set(
      'Content-Disposition',
      `attachment; filename=return-requests-${new Date()
        .toJSON()
        .slice(0, 10)}.xls`
    )
  } catch (error) {
    ctx.status = 500
    ctx.body = { error: error.message }
  }

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
