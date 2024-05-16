import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { useCssHandles } from 'vtex.css-handles'
import { Card, Button, Alert} from 'vtex.styleguide'

import CREATE_GOODWILL from '../../graphql/createGoodwill.gql'
import { OrderSummary } from '../../../../typings/Summary'
import { GoodwillCreated, MutationCreateGoodwillArgs } from '../../../../typings/GoodwillRequest'
import { GoodwillInformationTable } from './GoodwillInformationTable'
import { getCurrency } from '../../utils/constants'
import { OrderSummaryState } from '../../provider/OrderToGoodwillReducer'

interface Props {
  data: OrderSummary | undefined
  goodwillRequest: OrderSummaryState
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

export const ConfirmAndSubmitGoodwill = ({data , goodwillRequest}: Props) => {

  const [createGoodwillRequest, { loading: creatingGoodwill }] = useMutation<
    { createGoodwillRequest: GoodwillCreated },
    MutationCreateGoodwillArgs
  >(CREATE_GOODWILL)

  const {
    navigate,
    hints: { phone },
  } = useRuntime()
  const [confirmationStatus, setConfirmationStatus] =
    useState<SubmissionStatus>('idle')

  const [errorMessage, setErrorMessage] = useState<string>('')

  const handles = useCssHandles(CSS_HANDLES)

  const handleCreateGoodwill = async () => {
    if (creatingGoodwill) return
    try {
      const { errors } = await createGoodwillRequest({
        variables: {
          goodwillRequest: { ... goodwillRequest },
        },
      })

      if (errors) {
        throw new Error('Error creating goodwill')
      }
      setConfirmationStatus('success')
    } catch (error) {
      let errorMessage = 'An error invoicing has occurred'
      if (typeof error === 'object' && error !== null && 'graphQLErrors' in error){
        const graphQLErrorsArray = error.graphQLErrors as any[];
        const response = await Promise.all(
          graphQLErrorsArray.map((error)=>{
            if(error.extensions.exception.response.data.message.includes("Goodwill already created for orderId")){
              return ('A goodwill with the same ID already exists.')
            }
          return  error.extensions.exception.response.data.message 
        })
        )
        errorMessage = String(response)
      }
      setErrorMessage(errorMessage)
      setConfirmationStatus('error')
    }
  }

  const handleAlertRedirect = () => {    
    setConfirmationStatus('idle')
    navigate({
      to: '/admin/app/seller/goodwill/' ,
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
                      <FormattedMessage id="return-app.goodwill-order-details.page-header-credit" />
                    </div>
                    <div className="mt2">
                      <div className="f4 fw5 c-on-base">{goodwillRequest.goodwillCreditId}</div>
                    </div>
                  </div>

                  <div
                    className={`flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
                  >
                    <div className="c-muted-2 f6">
                      <FormattedMessage id="return-app.goodwill-order-details.page-amount-compensated" />
                    </div>
                      <div className="f4 fw5 c-on-base">{getCurrency (goodwillRequest.goodwillCreditAmount)}</div>
                  </div>
                </div>   
                         
              </section>
              { goodwillRequest.items.length > 0 ? (
                <GoodwillInformationTable
                items={data?.items}
                selectedItems={goodwillRequest.items}
                />      
                ): null
              }
              
              { goodwillRequest.shippingCost ? (
              <section
                  className={`w-100 flex-wrap justify-between ${
                    phone ? 'flex-column' : ''
                  }`}
                > 
                <div className="w-100 ba br3 b--muted-4 center">
                  <div className="w-100 mt4 pd4">
                    <div className="mh3 f4 mb2 fw5">
                      <FormattedMessage id="return-app.goodwill-order-details.page-header-shipping" />
                    </div>
                  </div>                
                  <div className="mt2 ml4">
                    <div className="f4 fw5 c-on-base"><b>{getCurrency(goodwillRequest.shippingCost)}</b></div>
                  </div>
                  <div
                    className={`flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
                  >
                    <div className="f6 mv0 mr3 gray b">
                      <FormattedMessage id="return-app.return-information-table.table-row.p-reason" />
                    </div>
                    <div className="f6 mv0 gray">{goodwillRequest.reason}</div>
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
                <FormattedMessage id={`return-app.confirm-and-submit.alert.success-goodwill`} />
              </Alert>
            )}
            {confirmationStatus !== 'error' ? null : (
              <Alert
                type={confirmationStatus}
                action={{
                  label: (
                    <FormattedMessage id={`return-app.confirm-and-submit.alert.error.label`} />
                  ),
                  onClick: () => handleCreateGoodwill(),
                }}
              >
              <p>{errorMessage}</p>
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
                    onClick={handleCreateGoodwill}
                    isLoading={creatingGoodwill}
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
