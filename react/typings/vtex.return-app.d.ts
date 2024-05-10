interface ItemToReturn {
  id: string
  quantity: number
  quantityAvailable: number
  isExcluded: boolean
  name: string
  localizedName?: string | null
  imageUrl: string
  orderItemIndex: number
}

interface ItemToGoodwill {
  id: string
  name: string
  quantityAvailablePerItem: number
  amountAvailablePerItem: number
  name: string | null
  imageUrl: string
  isExcluded: boolean
  amount: number
  quantity: number
  goodwill: number
}

type MaybeGlobal<T> = T | null

type GeoCoordinates = Array<MaybeGlobal<number>>
