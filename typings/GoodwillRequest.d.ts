export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type QueryGoodwillArgs = {
  requestId: Scalars['ID']
}

export interface GoodwillRequestInput {
  orderId: string
  goodwillCreditId: string
  goodwillCreditAmount: number
  shippingCost: number | undefined
  items: Item[]
  reason: string | undefined
}

export interface Item {
  id: string
  amount: number
  description: string
}

export interface GoodwillResponse {
  message: string
  goodwill: Goodwill
}

export interface Goodwill {
  orderId: string
  goodwillCreditId: string
  goodwillCreditAmount: number
  shippingCost: number
  items: any[]
  reason: string
  sellerId: string
}

export type MutationCreateGoodwillArgs = {
  goodwillRequest: GoodwillRequestInput
}

export type GoodwillCreated = {
  message: Scalars['String']
  goodwill: Goodwill
}
