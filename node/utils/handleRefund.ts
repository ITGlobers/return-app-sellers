import { ResolverError } from '@vtex/api'

import type { OMSCustom } from '../clients/oms'
import type { GiftCard as GiftCardClient } from '../clients/giftCard'
import type {
  GiftCard,
  Maybe,
  ReturnRequest,
  Status,
} from '../../typings/ReturnRequest'

interface HandleRefundProps {
  currentStatus: Status
  previousStatus?: Status
  refundPaymentData: ReturnRequest['refundPaymentData']
  orderId: string
  createdAt: string
  userEmail: string
  refundInvoice: ReturnRequest['refundData']
  clients: {
    omsClient: OMSCustom
    giftCardClient: GiftCardClient
  }
  accountInfo: any
}

export const handleRefund = async ({
  currentStatus,
  previousStatus,
  refundPaymentData,
  orderId,
  createdAt,
  refundInvoice,
  clients,
  userEmail,
  accountInfo,
}: HandleRefundProps): Promise<Maybe<{ giftCard: GiftCard }>> => {
  // To avoid handling the amountRefunded after it has been already done, we check the previous status.
  // If the current status is already amountRefunded, it means the refund has already been done and we don't need to do it again.
  const shouldHandle =
    currentStatus === 'amountRefunded' &&
    previousStatus !== 'amountRefunded' &&
    refundInvoice

  if (!shouldHandle) {
    return null
  }

  const { omsClient, giftCardClient } = clients

  const { refundPaymentMethod, automaticallyRefundPaymentMethod } =
    refundPaymentData ?? {}

  if (refundPaymentMethod === 'giftCard') {
    try {
      const createGiftCardRequest = {
        createdAt,
        invoiceNumber: refundInvoice?.invoiceNumber as string,
        invoiceValue: refundInvoice?.invoiceValue as number,
        userEmail,
      }

      const giftCard = await giftCardClient.createGiftCard({
        parentAccountName: accountInfo.parentAccountName,
        requestCreate: createGiftCardRequest,
        auth: accountInfo,
      })

      return giftCard
    } catch (error) {
      throw new ResolverError('Error creating/updating gift card')
    }
  }

  const refundPayment =
    refundPaymentMethod === 'card' ||
    (refundPaymentMethod === 'sameAsPurchase' &&
      automaticallyRefundPaymentMethod)

  if (refundPayment) {
    try {
      const order = await omsClient.order(orderId)

      await omsClient.createInvoice(order.orderId, {
        type: 'Input',
        issuanceDate: createdAt,
        invoiceNumber: refundInvoice?.invoiceNumber,
        invoiceValue: refundInvoice?.invoiceValue,
        items:
          refundInvoice?.items?.map((item) => {
            return {
              id: item.id,
              price: item.price - item.restockFee,
              quantity: item.quantity,
            }
          }) ?? [],
      })

      return null
    } catch (error) {
      throw new ResolverError('Error creating refund invoice')
    }
  }

  return null
}
