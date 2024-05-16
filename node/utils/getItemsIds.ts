import { OrderDetailResponse } from '@vtex/clients'
import { environment } from './constants'

export const getItemsIds = async (ctx: Context, body: any): Promise<any> => {
  try {
    const {
      clients: { catalog },
    } = ctx

    await Promise.all(
      body.items.map(async (item: any) => {
        try {
          const response = await catalog.getSKU(item.id)
          const AlternateIdValues = response.AlternateIdValues.find(
            (value: any) => value.includes(environment)
          )

          const id = AlternateIdValues?.split('-')[1]
          if (id) {
            item.id = id
          }
        } catch (error) {
          console.error('Error fetching SKU for item:', item.id, error)
        }
      })
    )

    return body
  } catch (error) {
    console.error('Unexpected error:', error)
    return body
  }
}

export const getItemsToInvoice = async (
  body: any,
  order: OrderDetailResponse
): Promise<any> => {
  try {
    const itemsToInvoice = await Promise.all(
      body.items.map(async (item: any) => {
        const exist = order.items.some(
          (itemOrder: any) => itemOrder.id === item.id
        )
        if (exist) {
          return item
        } else {
          const refId = `${environment}-${item.id}`
          const alternateItem = order.items.find((item) => item.refId === refId)

          if (alternateItem) {
            return { ...item, id: alternateItem.id }
          } else {
            return null
          }
        }
      })
    )

    const filteredItemsToInvoice = itemsToInvoice.filter(
      (item) => item !== null
    )

    body.items = filteredItemsToInvoice

    return body
  } catch (error) {
    console.error('Error in getItemsToInvoice:', error)
    return body
  }
}
