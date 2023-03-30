import { ResolverError } from '@vtex/api'

import type { OMSCustom } from '../clients/oms'
import type { GiftCard as GiftCardClient } from '../clients/giftCard'
import { GiftCard, Maybe, ReturnRequest, Status } from '../../typings/ReturnRequest'
import { Account } from '../clients/account'

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
    accountClient: Account
  }
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

  const { omsClient, giftCardClient , accountClient } = clients


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
      console.log(JSON.stringify( createGiftCardRequest))
      const accountInfo = await accountClient.getInfo()  
      const giftCard = await giftCardClient.createGiftCard(accountInfo , createGiftCardRequest)
     
      return giftCard
    } catch (error) {
      console.log(error)
      throw new ResolverError('Error creating/updating gift card')
    }
  }

  const refundPayment =
    refundPaymentMethod === 'card' ||
    (refundPaymentMethod === 'sameAsPurchase' &&
      automaticallyRefundPaymentMethod)

  if (refundPayment) {
    try {
      await omsClient.createInvoice(orderId, {
        type: 'Input',
        issuanceDate: createdAt,
        invoiceNumber: refundInvoice?.invoiceNumber as string,
        invoiceValue: refundInvoice?.invoiceValue as number,
        items:
          refundInvoice?.items?.map((item) => {
            return {
              id: item.id as string,
              price: (item.price as number) - (item.restockFee as number),
              quantity: item.quantity as number,
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
