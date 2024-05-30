export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type OrderSummary = {
  __typename?: 'OrderSummary'
  id: string
  orderId: string
  orderValue: number
  shippingValue: number
  amountsAvailable: AmountsAvailable
  items: ItemSummary[]
  transactions: Transaction[]
  creationDate: string
}

export type AmountsAvailable = {
  order: number
  shipping: number
}

export type ItemSummary = {
  id: string
  unitCost: number
  quantity: number
  amount: number
  amountAvailablePerItem: AmountAvailablePerItem
  name: string
  image: string
  sellerSku: string
}

export type AmountAvailablePerItem = {
  amount: number
  quantity: number
}

export type Transaction = {
  id: string
  amount: number
  type: string
  status: string
  metadata: string
}

export type QueryOrderSummaryArgs = {
  orderId: Scalars['ID']
}
