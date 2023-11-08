
import { InvoicedItem } from '../../typings/OrdertoReturn'
import type { Catalog } from '../clients/catalog'
import type { CatalogGQL } from '../clients/catalogGQL'

/**
 * @returns the most up to date SKU translations, if it exist
 */
export const translateItemName = async (
  id: string,
  originalName: string,
  catalog: Catalog,
  catalogGQL: CatalogGQL,
  isSellerPortal: boolean
) => {
  try {
    let skuName: string | undefined

    if(isSellerPortal){
      skuName = await catalog.getSKUByID(id)
    } else {
      skuName = await catalogGQL.getSKUTranslation(id)
    }

    const isLocalized = skuName && skuName !== originalName

    return isLocalized ? skuName : null
  } catch (error) {
    error.message = 'Error translating item name'
    throw error
  }
}

export function handleTranlateItems(
  items: InvoicedItem[],
  catalog: Catalog,
  CatalogGQL: CatalogGQL,
  isSellerPortal: boolean
): Promise<InvoicedItem[]> {
  return Promise.all(
    items.map(async (item: InvoicedItem) => {
      return {
        ...item,
        localizedName: await translateItemName(
          item.id,
          item.name,
          catalog,
          CatalogGQL,
          isSellerPortal
        ),
      }
    })
  )
}
