interface RefundPaymentData {
  transactionId?: string
  refundPaymentMethod: 'bank' | 'card' | 'giftCard' | 'sameAsPurchase'
}

interface GoodwillDraft {
  message: string
  data: any
  invoicesData: Invoice
}

interface Goodwill {
  id: string
  orderId: string
  sellerId: string
  status: 'draft' | 'failed' | 'amountRefunded'
  refundPaymentData?: RefundPaymentData
  goodwillCreditId: string
  goodwillCreditAmount: number
  shippingCost: number
  items: [GoodwillItem]
  reason: string
  logs: [GoodwillLog]
}

interface GoodwillItem {
  id: string
  amount: number
  description: string
}

interface GoodwillLog {
  detail: string
}

interface Invoice {
  type: 'Input' | 'Output'
  issuanceDate: string
  invoiceNumber: string
  invoiceValue: number
  items?: InvoiceItem[]
  restitutions: Restitutions
  seller: string
}

interface InvoiceItem {
  id: string
  description: string
  price: number
  quantity: number
}

interface Restitutions {
  Refund: Refund
}

interface Refund {
  value: number
  giftCardData: any
  items: RefundItem[]
}

interface RefundItem {
  useFreight: boolean
  id: string
  quantity: number
  price: number
  description: string
  isCompensation: boolean
  compensationValue: number
}
