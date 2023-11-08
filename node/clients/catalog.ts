import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export class Catalog extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public getCategoryTree = async (): Promise<CategoryTree[]> =>
    this.http.get('/api/catalog_system/pub/category/tree/100', {
      metric: 'catalog-get-category-tree',
    })

  public async getSKUByID (sku: string) : Promise<any | undefined> {
    try {
      const response = await this.http.get(`/api/catalog-seller-portal/products/sku-id=${sku}`, {
        metric: 'catalog-get-sku-id',
        headers: {
          VtexIdClientAutCookie: this.context.adminUserAuthToken  || "",
        }
      })

      if(response?.skus.length > 0) {
        const currentSku = response.skus.find((item:any) => item.id == sku)

        if(currentSku){
          return currentSku?.name
        }
      }

      return response?.name

    } catch (error) {
      throw error
    }

  } 
}
