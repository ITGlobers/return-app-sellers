import React, { ChangeEvent, useEffect, useState } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { Button, Input, InputCurrency ,Divider } from 'vtex.styleguide'
import { ItemsListGoodwill } from './ItemsListGoodwill'
import { CustomMessage } from './layout/CustomMessage'
import { getCurrency } from '../../utils/constants'
import { useGoodwillRequest } from '../../hooks/useGoodwillRequest'

const CSS_HANDLES = [
  'returnDetailsContainer',
  'orderIdDetailsWrapper',
  'creationDateDetailsWrapper',
] as const

export const GoodwillDetails = (props: any) => {
  const orderId = props?.match?.params?.orderId || props?.params?.orderId

  const { onPageChange, items, creationDate , amountsAvailable, goodwillRequest } =
    props
  const handles = useCssHandles(CSS_HANDLES)
  const {
    actions: { updateGoodwillRequest },
  } = useGoodwillRequest()
  
  const handleFieldsValidation = () => {
    updateGoodwillRequest({
      type: 'updateOrderId',
      payload: orderId,
    })
    onPageChange('submit-form')
    typeof window !== 'undefined' && window.scrollTo(0, 0)
  };

  useEffect(() => {
    setButton();
    handleDescriptionShipping();
  }, [goodwillRequest]);

  const [shippingMessageError, setShippingMessageError] = useState<boolean>(false);
  const [descriptionRequiredError, setDescriptionRequiredError] = useState<boolean>(false);
  const [creditIdRequiredError, setCreditIdRequiredError] = useState<boolean>(!goodwillRequest.goodwillCreditId);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);


  const setButton = () => {
    let disabled = false;

    if (creditIdRequiredError || (!goodwillRequest.items.length && (!goodwillRequest.shippingCost || !goodwillRequest.reason))) {
      disabled = true;
    } else if((goodwillRequest.shippingCost && !goodwillRequest.reason)){
        disabled = true;
    }else if(shippingMessageError){
      disabled = true;
    }else{
      const updatedItems = items
      const description = goodwillRequest.items.some(item => !item.description);
      const amount = goodwillRequest.items.some(item => item.amount < 0 );
      const amountGreaterThanUpdated = goodwillRequest.items.some(item => {
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

    const itemsAmount = goodwillRequest.items.reduce((total, item) => {
      return total + item.amount;
    }, 0);
    const total  =  shipping + itemsAmount

    updateGoodwillRequest({
      type: 'updateGoodwillCreditAmount',
      payload: total,
    })
  }

  const handleCreditIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if(!value){
      setCreditIdRequiredError(true)
    }else{
      setCreditIdRequiredError(false)
    }
    updateGoodwillRequest({
      type: 'updateGoodwillCreditId',
      payload: value,
    })
  }
  
  const handleDescription = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target

    updateGoodwillRequest({
      type: 'updateDescriptionShipping',
      payload: value,
    })
  }

  const handleDescriptionShipping = () => {
    if(goodwillRequest.shippingCost && !goodwillRequest.reason){
      setDescriptionRequiredError(true)
    }else{
      setDescriptionRequiredError(false)
    }
  }
   
  const handleShippingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const shippingInput = parseFloat(value)
    if(shippingInput === goodwillRequest.shippingCost) return
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
    updateGoodwillRequest({
      type: 'updateShippingCost',
      payload: newShipping,
    })

    calculateAmountShipping(newShipping);
  }

  const valueNegative = goodwillRequest.shippingCost < 0
  return (
    <>   
    <div className={`${handles.returnDetailsContainer} mb5`}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={ buttonDisabled }

          onClick={handleFieldsValidation}
        >
          <FormattedMessage id="return-app.return-order-details.button.next.goodwill" />
        </Button>
        
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
         <b>
          <FormattedMessage id="return-app.goodwill-order-details.page-amount-compensated" />  { getCurrency(goodwillRequest.goodwillCreditAmount) }
        </b>
      </div>
      <div className="w-100 flex flex-row-ns ba br3 b--muted-4 flex-column center">
        <div
          className={`${handles.orderIdDetailsWrapper} flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
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
          className={`${handles.creationDateDetailsWrapper} flex flex-column pa4 b--muted-4 flex-auto bb bb-0-ns br-ns`}
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
          <FormattedMessage id="return-app.goodwill-order-details.section-products" />
        </div>
      </div>
      <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
        <FormattedMessage id="return-app.goodwill-order-details.page-header.subtitle" />
      </div>
      <div className="overflow-scroll">
        <ItemsListGoodwill items={items} isAdmin goodwillRequest= {goodwillRequest} />
      </div>
      
    </div> 
    <div className="w-100 flex ba br3 b--muted-4 flex-column center">
      <div className="flex-ns flex-wrap flex-row">
        <div className="w-100 mt4 pd4">
          <div className="f4 mb5 fw5 ma4">
            <FormattedMessage id="return-app.goodwill-order-details.page-header-shipping" />
          </div>
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
          <FormattedMessage id="return-app.goodwill-order-details.page-header-shipping.subtitle" />
        </div>
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
          <InputCurrency
            name= 'shipping'
            value = {goodwillRequest.shippingCost ? goodwillRequest.shippingCost / 100 : undefined}
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
              <FormattedMessage id={`return-app.return-goodwill-shipping-value.error${valueNegative ? '-negative' : ''}`} />
              }
            />
          ) : null}
        </div> 

        <Divider orientation="horizontal" />   
        <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
          <FormattedMessage id="return-app.goodwill-order-details.page-header-shipping.description">
            {(formattedMessage) => (
              <Input
                name= 'description'
                value = {goodwillRequest.reason}
                onChange={handleDescription}
                placeholder={formattedMessage}
              />
            )}
          </FormattedMessage> 
          {descriptionRequiredError  ? (
            <CustomMessage
              status="error"
              message={
                <FormattedMessage id={`return-app.return-goodwill-shipping-description.error`} />
              }
            />
          ) : null}

        </div>
        <div className="flex-ns flex-wrap flex-row">
          <div className="w-100 mt4 pd4">
            <div className="f4 mb5 fw5 ma4">
              <FormattedMessage id="return-app.goodwill-order-details.page-header-credit" />
            </div>
          </div>
          <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns w-80">
            <FormattedMessage id="return-app.goodwill-order-details.page-header-credit.subtitle" />
          </div>
          <div className="t-body lh-copy c-muted-1 mb3 ml3 w-two-thirds-ns">
            <Input
              value = {goodwillRequest.goodwillCreditId || ''}
              name="creditId"
              onChange={handleCreditIdChange}
            />
            {creditIdRequiredError  ? (
            <CustomMessage
              status="error"
              message={
                <FormattedMessage id={`return-app.return-goodwill-credit-id.error`} />
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
