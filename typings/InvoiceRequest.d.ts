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

export interface InvoiceRequestInput {
  type: string
  description: string
  issuanceDate: string
  invoiceNumber: string
  invoiceValue: number
  invoiceKey: string
  items: Array<Item>
}

export interface Item {
  id: string
  amount: number
  description: string
  quantity: number
}

export interface InvoiceResponse {
  date: string
  orderId: string
  receipt: string
}

export type MutationCreateInvoiceArgs = {
  orderId: string
  invoiceRequest: InvoiceRequestInput
}
