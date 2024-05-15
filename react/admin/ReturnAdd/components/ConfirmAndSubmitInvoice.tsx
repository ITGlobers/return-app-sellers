import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { useCssHandles } from 'vtex.css-handles'
import { Card, Button, Alert} from 'vtex.styleguide'

import CREATE_INVOICE from '../../graphql/createInvoice.gql'
import { OrderSummary } from '../../../../typings/Summary'
import { InvoiceInformationTable } from './InvoiceInformationTable'
import { getCurrency } from '../../utils/constants'
import { InvoiceState } from '../../provider/OrderToInvoiceReducer'
import { InvoiceResponse, MutationCreateInvoiceArgs } from '../../../../typings/InvoiceRequest'
import { formatInvoiceRequestInput } from '../../utils/formatItemsToGoodwill'

interface Props {
  data: OrderSummary | undefined
  orderId: string
  invoiceRequest: InvoiceState
}

type SubmissionStatus = 'success' | 'error' | 'idle'

const CSS_HANDLES = [
  'submitDetailsContainer',
  'contactAddressWrapper',
  'paymentCommentWrapper',
  'confirmationActionsContainer',
  'backButtonWrapper',
  'submitButtonWrapper',
] as const

export const ConfirmAndSubmitInvoice = ({data , invoiceRequest , orderId}: Props) => {

  const [createInvoiceRequest, { loading: creatingInvoice }] = useMutation<
    { createInvoiceRequest: InvoiceResponse },
    MutationCreateInvoiceArgs
  >(CREATE_INVOICE)

  const {
    navigate,
    hints: { phone },
  } = useRuntime()
  const [confirmationStatus, setConfirmationStatus] =
    useState<SubmissionStatus>('idle')

  const [error, setErrorMessage] = useState<string>('')

  const handles = useCssHandles(CSS_HANDLES)

  const handleCreateInvoice = async () => {
    if (creatingInvoice) return
    try {
      const { errors } = await createInvoiceRequest({
        variables: {
          orderId: orderId,
          invoiceRequest: formatInvoiceRequestInput(invoiceRequest),
        },
      })

      if (errors) {
        throw new Error('Error creating Invoice')
      }
      setConfirmationStatus('success')
    } catch (error) {
      let errorMessage = 'An error invoicing has occurred'
      if (typeof error === 'object' && error !== null && 'graphQLErrors' in error){
        const graphQLErrorsArray = error.graphQLErrors as any[];
        if(graphQLErrorsArray.length > 0){
          const response = await Promise.all(
          graphQLErrorsArray.map((error)=>{
            return  error.extensions.exception.response.data.message ?? error.extensions.exception.response.data.error.message 
          })
          )
          errorMessage = String(response)
        }
      }
      setErrorMessage(errorMessage)
      setConfirmationStatus('error')
    }
  }

  const handleAlertRedirect = () => {    
    setConfirmationStatus('idle')
    navigate({
      to: '/admin/app/seller/return/' ,
    })
  }


  return (
    <>
      {
        <>
          <div className="mv8">
            <Card>              
              <div
                className={`${handles.confirmationActionsContainer} flex flex-wrap`}
              >
                <section
                  className={`${
                    handles.contactAddressWrapper
                  } w-100 flex flex-wrap justify-between ${
                    phone ? 'flex-column' : ''
                  }`}
                > 

                <div className="w-100 flex flex-row-ns ba br3 b--muted-4 flex-column center">
                  <div
                    className={`flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
                  >
                    <div className="c-muted-2 f6">
                      <FormattedMessage id="return-app.invoice-order-details.page-header-invoice" />
                    </div>
                    <div className="w-80 mt2">
                      <div className="f4 fw5 c-on-base">{invoiceRequest?.invoiceNumber}</div>
                    </div>
                  </div>

                  <div
                    className={`flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
                  >
                    <div className="c-muted-2 f6">
                      <FormattedMessage id="return-app.goodwill-order-details.page-amount-compensated" />
                    </div>
                    <div className="w-80 mt2">
                      <div className="f4 fw5 c-on-base">{getCurrency (invoiceRequest.invoiceValue)}</div>
                    </div>
                  </div>
                </div>   
                         
              </section>
 
              { invoiceRequest.items.length > 0 ? (
                <InvoiceInformationTable
                items={data?.items}
                selectedItems={invoiceRequest.items}
                />      
                ): null
              }

              { invoiceRequest.shippingCost ? (
              <section
                  className={`w-100 flex-wrap justify-between ${
                    phone ? 'flex-column' : ''
                  }`}
                > 
                <div className="w-100 ba br3 b--muted-4 center">
                  <div className="w-100 mt4 pd4">
                    <div className="mh3 f4 mb2 fw5">
                      <FormattedMessage id="return-app.return-order-details.page-header-shipping" />
                    </div>
                  </div>                
                  <div className="mt2 ml4 mb2">
                    <div className="f4 fw5 c-on-base"><b>{getCurrency(invoiceRequest.shippingCost)}</b></div>
                  </div>                 
                </div>   
                         
              </section>
              ) : null }

              </div>
            </Card>
          </div>
          <section
            className={`${handles.confirmationActionsContainer} flex justify-center`}
          >
            {confirmationStatus !== 'success' ? null : (
              <Alert
                type={confirmationStatus}
                action={{
                  label: (
                    <FormattedMessage id={`return-app.confirm-and-submit.alert.label-return`} />
                  ),
                  onClick: () => handleAlertRedirect(),
                }}
              >
                <FormattedMessage id={`return-app.confirm-and-submit.alert.success-invoice`} />
              </Alert>
            )}
            {confirmationStatus !== 'error' ? null : (
              <Alert
                type={confirmationStatus}
                action={{
                  label: (
                    <FormattedMessage id={`return-app.confirm-and-submit.alert.error.label`} />
                  ),
                  onClick: () => handleCreateInvoice(),
                }}
              >
              <p>{error}</p>
              </Alert>
            )}
            {confirmationStatus !== 'idle' ? null : (
              <div
                className={`flex ${
                  phone ? 'w-100 flex-column' : 'justify-center'
                }`}
              >
                <div
                  className={`${handles.submitButtonWrapper} ${
                    phone ? '' : 'mr3'
                  }`}
                >
                  <Button
                    block={phone}
                    size={phone ? 'normal' : 'small'}
                    onClick={handleCreateInvoice}
                    isLoading={creatingInvoice}
                  >
                    <FormattedMessage id={`return-app.confirm-and-submit.button.submit`} />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </>
      }
    </>
  )
}
