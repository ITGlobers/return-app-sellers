import React, { ChangeEvent, useEffect, useState } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { Button, Input, InputCurrency ,Toggle } from 'vtex.styleguide'
import type { Page } from '../CreateReturnRequest'
import { CustomMessage } from './layout/CustomMessage'
import { getCurrency } from '../../utils/constants'
import { useInvoiceRequest } from '../../hooks/useInvoiceRequest'
import { InvoiceState } from '../../provider/OrderToInvoiceReducer'
import { ItemsListInvoice } from './ItemsListInvoice'

const CSS_HANDLES = [
  'returnDetailsContainer',
  'orderIdDetailsWrapper',
  'creationDateDetailsWrapper',
] as const


interface Props {
  onPageChange: (page: Page) => void
  items: ItemToGoodwill[]
  creationDate: string
  invoiceRequest: InvoiceState
}

export const InvoiceDetails = (props: any & Props) => {
  const orderId = props?.match?.params?.orderId || props?.params?.orderId

  const { onPageChange, items, creationDate , amountsAvailable, invoiceRequest } =
    props
  const handles = useCssHandles(CSS_HANDLES)
  const {
    actions: { updateInvoiceRequest },
  } = useInvoiceRequest()
  
  const handleFieldsValidation = () => {

    onPageChange('submit-form')
    typeof window !== 'undefined' && window.scrollTo(0, 0)
  };

  useEffect(() => {
    setButton();
  }, [invoiceRequest]);

  const invoiceKey = JSON.parse(invoiceRequest.invoiceKey)
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingMessageError, setShippingMessageError] = useState<boolean>(false);
  const [invoiceNumberRequiredError, setInvoiceNumberRequiredError] = useState<boolean>(invoiceRequest?.invoiceNumber ? false : true);
  const [preRefund, setPreRefund] = useState<boolean>(invoiceKey.preRefund);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);


  const setButton = () => {
    let disabled = false;

    if (invoiceNumberRequiredError || !invoiceRequest.items.length) {
      disabled = true;
    } else if(shippingMessageError){
      disabled = true;
    }else{
      const updatedItems = items
      const description = invoiceRequest.items.some(item => !item.description);
      const amount = invoiceRequest.items.some(item => item.amount < 0 );
      const amountGreaterThanUpdated = invoiceRequest.items.some(item => {
        const updatedItem = updatedItems.find(updatedItem => updatedItem.id === item.id);
        return updatedItem && item.amount > updatedItem.amountAvailablePerItem;
      });
      if((description || amount || amountGreaterThanUpdated)){
        disabled =  true
      }
    }
    

    setButtonDisabled(disabled);
  };

  const calculateAmountShipping = (shipping: number): any => {

    const itemsAmount = invoiceRequest.items.reduce((total, item) => {
      return total + item.amount;
    }, 0);
    const total  =  shipping + itemsAmount
 
    updateInvoiceRequest({
      type: 'updateShippingCost',
      payload: shipping,
    })
   
    updateInvoiceRequest({
      type: 'updateInvoiceValue',
      payload: total,
    })
  }

  const handleInvoiceNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if(!value){
      setInvoiceNumberRequiredError(true)
    }else{
      setInvoiceNumberRequiredError(false)
    }
    updateInvoiceRequest({
      type: 'updateInvoiceNumber',
      payload: value,
    })
  }
   
  const handleShippingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const shippingInput = parseFloat(value)
    const shipping = amountsAvailable.shipping / 100
    let newValue = 0
    if(shippingInput=== 0){
      setShippingMessageError(true)
    } else if(!value){
      setShippingMessageError(false)
    } else if (shippingInput < 0) {
      setShippingMessageError(true)
      newValue = shippingInput
    } else if (shippingInput > shipping) {
      newValue = shippingInput
      setShippingMessageError(true)
    } else{
      setShippingMessageError(false)
      newValue = shippingInput
    }
    const newShipping = Math.round(newValue * 100)
    setShippingCost(newShipping)
    calculateAmountShipping(newShipping);
  }

  const handlePreRefundOption = (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const { checked } = e.target

      updateInvoiceRequest({
        type: 'updateInvoiceKey',
        payload:JSON.stringify({ preRefund: checked }),
      })
      setPreRefund(checked)
    }

  return (
    <>   
    <div className={`${handles.returnDetailsContainer} mb5`}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={ buttonDisabled }

          onClick={handleFieldsValidation}
        >
          <FormattedMessage id="return-app.return-order-details.button.next.invoice" />
        </Button>
        
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
         <b>
          <FormattedMessage id="return-app.goodwill-order-details.page-amount-compensated" />  { getCurrency(invoiceRequest?.invoiceValue) }
        </b>
      </div>
      <div className="w-100 flex flex-row-ns ba br3 b--muted-4 flex-column center">
        <div
          className={`${handles.orderIdDetailsWrapper} flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns w-60`}
        >
          <div>
            <div className="c-muted-2 f6">
              <FormattedMessage id="return-app.return-order-details.page-header.order-id" />
            </div>
            <div className="w-80 mt2">
              <div className="f4 fw5 c-on-base">{orderId}</div>
            </div>
          </div>
        </div>
        <div
          className={`${handles.creationDateDetailsWrapper} flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns w-60`}
        >
          <div className="c-muted-2 f6">
            <FormattedMessage id="return-app.return-order-details.page-header.creation-date" />
          </div>
          <div className="w-80 mt2">
            <div className="f4 fw5 c-on-base">
              <FormattedDate
                value={creationDate}
                day="2-digit"
                month="2-digit"
                year="numeric"
              />
            </div>
          </div>
        </div>
      </div>   
    </div>
  
    <div className="w-100 flex ba br3 b--muted-4 flex-column center">
      <div className="w-100 mt4 pd4">
        <div className="mh3 f4 mb5 fw5">
          <FormattedMessage id="return-app.invoice-order-details.section-products" />
        </div>
      </div>
      <div className="overflow-scroll">
        <ItemsListInvoice items={items} creationDate={creationDate} isAdmin invoiceRequest= {invoiceRequest} shipping={shippingCost}/>
      </div>
      
    </div> 
    <div className="w-100 flex ba br3 b--muted-4 flex-column center">
      <div className="flex-ns flex-wrap flex-row">
        <div className="w-100 mt4 pd4">
          <div className="f4 mb5 fw5 ma4">
            <FormattedMessage id="return-app.invoice-order-details.page-header-shipping" />
          </div>
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
          <FormattedMessage id="return-app.invoice-order-details.page-header-shipping.subtitle" />
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
          <InputCurrency
            name= 'shipping'
            currencyCode= 'EUR'
            onChange={handleShippingChange}
          />
          <FormattedMessage 
            id="return-app.goodwill-order-details.page-input-amount.description" 
          />
          {getCurrency(amountsAvailable.shipping)}
          {shippingMessageError  ? (
            <CustomMessage
              status="error"
              message={
              <FormattedMessage id={`return-app.return-goodwill-shipping-value.error${shippingCost < 0 ? '-negative' : ''}`} />
              }
            />
          ) : null}
        </div> 
         <div className="w-100 mt4 pd4">
          <div className="f4 mb5 fw5 ma4">
            <FormattedMessage id="return-app.invoice-order-details.page-header-prerefund" />
          </div>
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
          <FormattedMessage id="return-app.invoice-order-details.page-header-prerefund.subtitle" />
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
            <Toggle
              label={
                <FormattedMessage id="admin/return-app.section.prerefund.checkbox.label" />
              }
              checked={preRefund}
              semantic
              onChange={handlePreRefundOption}
            />
        </div> 
        <div className="flex-ns flex-wrap flex-row">
          <div className="w-100 mt4 pd4">
            <div className="f4 mb5 fw5 ma4">
              <FormattedMessage id="return-app.invoice-order-details.page-header-credit" />
            </div>
          </div>
          <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
            <FormattedMessage id="return-app.invoice-order-details.page-header-credit.subtitle" />
          </div>
          <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
            <Input
              value = {invoiceRequest?.invoiceNumber || ''}
              name="invoiceNumber"
              onChange={handleInvoiceNumberChange}
            />
            {invoiceNumberRequiredError  ? (
            <CustomMessage
              status="error"
              message={
                <FormattedMessage id={`return-app.return-invoice-credit-id.error`} />
              }
            />
          ) : null}
          </div>    
        </div>
      </div>
    </div>
  </>
  )
}
