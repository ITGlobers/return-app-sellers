import { OrderDetailResponse } from '@vtex/clients'
import { environment } from './constants'

export const getItemsIds = async (ctx: Context, body: any) => {
  try {
    const {
      clients: { catalog },
    } = ctx

    await Promise.all(
      body.items.map(async (item: any) => {
        const response = await catalog.getSKU(item.id)

        const AlternateIdValues = response.AlternateIdValues.find(
          (value: any) => value.includes(environment)
        )

        const id = AlternateIdValues.split('-')

        item.id = id[1] ?? item.id
      })
    )

    return body
  } catch (error) {
    return body
  }
}

export const getItemsToInvoice = async (
  body: any,
  order: OrderDetailResponse
) => {
  try {
    await Promise.all(
      body.items.map(async (item: any) => {
        const exist = order.items.some(
          (itemOrder: any) => itemOrder.id === item.id
        )
        if (exist) {
          return body
        } else {
          const refId = `${environment}-${item.id}`
          const AlternateIdValues = order.items.find(
            (item) => item.refId === refId
          )

          if (AlternateIdValues) {
            item.id = AlternateIdValues.id
          }
        }
      })
    )
    return body
  } catch (error) {
    return body
  }
}
