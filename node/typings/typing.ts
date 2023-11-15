
interface SellerGoodwill {
    orderId: string
    creditnoteID: string
    sellerId?: string
    status: 'new' | 'processing' | 'amountRefunded'
    creditAmount: number
    reason: string
    refundPaymentData: RefundPaymentData
  }
  
  type RefundPaymentData = {
    transactionId?: string
    refundPaymentMethod: 'bank' | 'card' | 'giftCard' | 'sameAsPurchase'
  }