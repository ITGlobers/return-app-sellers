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

export type ReturnRequestInput = {
  orderId: Scalars['String'];
  sellerName: Scalars['String'];
  marketplaceOrderId?: InputMaybe<Scalars['String']>;
  items: Array<ReturnRequestItemInput>;
  customerProfileData: CustomerProfileDataInput;
  pickupReturnData: PickupReturnDataInput;
  refundPaymentData: RefundPaymentDataInput;
  userComment?: InputMaybe<Scalars['String']>;
  locale: Scalars['String'];
};

export type ReturnRequestItemInput = {
  orderItemIndex: Scalars['Int'];
  quantity: Scalars['Int'];
  condition?: InputMaybe<ItemCondition>;
  returnReason: ReturnReasonInput;
};

export type ReturnReasonInput = {
  reason: Scalars['String'];
  otherReason?: InputMaybe<Scalars['String']>;
};

export enum ItemCondition {
  Unspecified = 'unspecified',
  NewWithBox = 'newWithBox',
  NewWithoutBox = 'newWithoutBox',
  UsedWithBox = 'usedWithBox',
  UsedWithoutBox = 'usedWithoutBox'
}

export type CustomerProfileDataInput = {
  name: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  phoneNumber: Scalars['String'];
};

export type PickupReturnDataInput = {
  addressId: Scalars['String'];
  address: Scalars['String'];
  city: Scalars['String'];
  state: Scalars['String'];
  country: Scalars['String'];
  zipCode: Scalars['String'];
  addressType: AddressType;
};

export enum AddressType {
  PickupPoint = 'PICKUP_POINT',
  CustomerAddress = 'CUSTOMER_ADDRESS'
}

export type RefundPaymentDataInput = {
  refundPaymentMethod: RefundPaymentMethod;
  iban?: InputMaybe<Scalars['String']>;
  accountHolderName?: InputMaybe<Scalars['String']>;
};

export enum RefundPaymentMethod {
  Bank = 'bank',
  Card = 'card',
  GiftCard = 'giftCard',
  SameAsPurchase = 'sameAsPurchase'
}

export type ReturnRequestResponse = {
  __typename?: 'ReturnRequestResponse';
  id: Scalars['ID'];
  orderId: Scalars['String'];
  refundableAmount: Scalars['Int'];
  sequenceNumber: Scalars['String'];
  createdIn: Scalars['String'];
  status: Status;
  dateSubmitted: Scalars['String'];
  userComment?: Maybe<Scalars['String']>;
  refundableAmountTotals: Array<RefundableAmountTotal>;
  customerProfileData: CustomerProfileData;
  pickupReturnData: PickupReturnData;
  refundPaymentData: RefundPaymentData;
  items: Array<ReturnRequestItem>;
  refundData?: Maybe<RefundData>;
  refundStatusData: Array<RefundStatusData>;
  cultureInfoData: CultureInfoData;
};

export enum Status {
  new = 'new',
  processing = 'processing',
  pickedUpFromClient = 'pickedUpFromClient',
  pendingVerification = 'pendingVerification',
  packageVerified = 'packageVerified',
  amountRefunded = 'amountRefunded',
  denied = 'denied',
  cancelled = 'cancelled'
}

export type CustomerProfileData = {
  __typename?: 'CustomerProfileData';
  userId: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
  phoneNumber: Scalars['String'];
};

export type PickupReturnData = {
  __typename?: 'PickupReturnData';
  addressId: Scalars['String'];
  address: Scalars['String'];
  city: Scalars['String'];
  state: Scalars['String'];
  country: Scalars['String'];
  zipCode: Scalars['String'];
  addressType: AddressType;
  returnLabel?: Maybe<Scalars['String']>;
};

export type RefundPaymentData = {
  __typename?: 'RefundPaymentData';
  refundPaymentMethod: RefundPaymentMethod;
  iban?: Maybe<Scalars['String']>;
  accountHolderName?: Maybe<Scalars['String']>;
  automaticallyRefundPaymentMethod?: Maybe<Scalars['Boolean']>;
};

export type ReturnRequestItem = {
  __typename?: 'ReturnRequestItem';
  orderItemIndex: Scalars['Int'];
  quantity: Scalars['Int'];
  condition: ItemCondition;
  returnReason: ReturnReason;
  id: Scalars['String'];
  sellingPrice: Scalars['Int'];
  tax: Scalars['Int'];
  name: Scalars['String'];
  localizedName?: Maybe<Scalars['String']>;
  imageUrl: Scalars['String'];
  unitMultiplier: Scalars['Float'];
  sellerId: Scalars['String'];
  sellerName: Scalars['String'];
  productId: Scalars['String'];
  refId: Scalars['String'];
};

export type ReturnReason = {
  __typename?: 'ReturnReason';
  reason: Scalars['String'];
  otherReason?: Maybe<Scalars['String']>;
};

export type RefundData = {
  __typename?: 'RefundData';
  invoiceNumber: Scalars['String'];
  invoiceValue: Scalars['Int'];
  refundedItemsValue: Scalars['Int'];
  refundedShippingValue: Scalars['Int'];
  giftCard?: Maybe<GiftCard>;
  items: Array<RefundItem>;
};

export type GiftCard = {
  __typename?: 'GiftCard';
  id: Scalars['String'];
  redemptionCode: Scalars['String'];
};

export type RefundItem = {
  __typename?: 'RefundItem';
  orderItemIndex: Scalars['Int'];
  quantity: Scalars['Int'];
  restockFee: Scalars['Int'];
  price: Scalars['Int'];
};

export type RefundStatusData = {
  __typename?: 'RefundStatusData';
  status: Status;
  submittedBy?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  comments: Array<RefundStatusComment>;
};

export type RefundStatusComment = {
  __typename?: 'RefundStatusComment';
  comment: Scalars['String'];
  createdAt: Scalars['String'];
  role: UserRole;
  visibleForCustomer?: Maybe<Scalars['Boolean']>;
  submittedBy: Scalars['String'];
};

export type ReturnRequestFilters = {
  status?: InputMaybe<Status>;
  sequenceNumber?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  /**
   * createdIn: It uses the field dateSubmitted in the return request schema to search for documents.
   * The field createdIn is auto generated when the document is created, not reflecting the real value for documents migrated from older versions.
   */
  createdIn?: InputMaybe<DateRangeInput>;
  orderId?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
  userEmail?: InputMaybe<Scalars['String']>;
};

export type DateRangeInput = {
  from: Scalars['String'];
  to: Scalars['String'];
};

export type ReturnRequestList = {
  __typename?: 'ReturnRequestList';
  list: Array<ReturnRequestResponse>;
  paging: Pagination;
};

export type RefundDataInput = {
  items: Array<RefundItemInput>;
  refundedShippingValue: Scalars['Int'];
};

export type RefundItemInput = {
  orderItemIndex: Scalars['Int'];
  quantity: Scalars['Int'];
  restockFee: Scalars['Int'];
};

export type ReturnRequestCommentInput = {
  value: Scalars['String'];
  visibleForCustomer: Scalars['Boolean'];
};

export type RefundableAmountTotal = {
  __typename?: 'RefundableAmountTotal';
  id: RefundableAmountId;
  value: Scalars['Int'];
};

export enum RefundableAmountId {
  Items = 'items',
  Shipping = 'shipping',
  Tax = 'tax'
}

export enum UserRole {
  AdminUser = 'adminUser',
  StoreUser = 'storeUser'
}

export type CultureInfoData = {
  __typename?: 'CultureInfoData';
  currencyCode: Scalars['String'];
  locale: Scalars['String'];
};

export type Pagination = {
  __typename?: 'Pagination';
  total: Scalars['Int'];
  pages: Scalars['Int'];
  currentPage: Scalars['Int'];
  perPage: Scalars['Int'];
};
