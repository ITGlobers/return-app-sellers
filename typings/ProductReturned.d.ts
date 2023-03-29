export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ProductReturnedInput = {
  imageUrl: Scalars['String'];
  skuId: Scalars['String'];
  sku: Scalars['String'];
  productId: Scalars['String'];
  ean: Scalars['String'];
  brandId: Scalars['String'];
  brandName: Scalars['String'];
  skuName: Scalars['String'];
  unitPrice: Scalars['Int'];
  quantity: Scalars['Int'];
  goodProducts: Scalars['Int'];
  reason: Scalars['String'];
  reasonCode: Scalars['String'];
  condition: Scalars['String'];
};

export type ProductReturned = {
  __typename?: 'ProductReturned';
  id: Scalars['ID'];
  createdIn: Scalars['String'];
  refundId: Scalars['String'];
  orderId: Scalars['String'];
  userId: Scalars['String'];
  imageUrl: Scalars['String'];
  skuId: Scalars['String'];
  sku: Scalars['String'];
  productId: Scalars['String'];
  ean: Scalars['String'];
  brandId: Scalars['String'];
  brandName: Scalars['String'];
  skuName: Scalars['String'];
  manufacturerCode: Scalars['String'];
  unitPrice: Scalars['Int'];
  quantity: Scalars['Int'];
  totalPrice: Scalars['Int'];
  goodProducts: Scalars['Int'];
  reason: Scalars['String'];
  reasonCode: Scalars['String'];
  condition: Scalars['String'];
  status: Scalars['String'];
  dateSubmitted: Scalars['String'];
  type: Scalars['String'];
};

export type ReturnRequestCreated = {
  __typename?: 'returnRequestCreated';
  returnRequestId: Scalars['String'];
};
