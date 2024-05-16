import React, { ChangeEvent, useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { Input, InputCurrency } from 'vtex.styleguide'
import { getCurrency, } from '../../utils/constants'
import { CustomMessage } from './layout/CustomMessage'
import { useGoodwillRequest } from '../../hooks/useGoodwillRequest'
import { OrderSummaryState } from '../../provider/OrderToGoodwillReducer'

interface Props {
  item: ItemToGoodwill
  goodwillRequest: OrderSummaryState
}

const CSS_HANDLES = [
  'detailsRowContainer',
  'detailsTdWrapper',
  'productSectionWrapper',
  'productText',
  'productImageWrapper',
  'productImage',
  'itemsDetailText',
] as const

export const ItemsDetailsGoodwill = (props: Props) => {
  const {
    item: {
      amountAvailablePerItem,
      amount,
      imageUrl,
      name,
      id
    },
  goodwillRequest
  } = props

  const {
    hints: { phone },
  } = useRuntime()
   
  const {
    actions: { updateGoodwillRequest, calculateAmount },
  } = useGoodwillRequest()
  
  useEffect(() => {
    handleDescriptionItem()
  }, [goodwillRequest]);
  
  const { items } = goodwillRequest
  const updatedItems = items
  const existingIndex = updatedItems.findIndex(item => item.id === id);
  
  const handles = useCssHandles(CSS_HANDLES)
  
  const [itemMessageError, setItemMessageError] = useState<boolean>(false);
  const [descriptionRequiredError, setDescriptionRequiredError] = useState<boolean>(false);
  
  const handleAmountChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const itemInput = parseFloat(value)
    
    if(itemInput=== goodwillRequest.items[existingIndex]?.amount) return
    
    const amount = amountAvailablePerItem / 100
    if(itemInput === 0){
      setItemMessageError(true)
    } else if(!value){
      setItemMessageError(false)
    }  else if (itemInput < 0) {
      setItemMessageError(true)
    }else if (itemInput > amount) {
      setItemMessageError(true)
    } else{
      setItemMessageError(false)
    }
    setItemsAmount(itemInput)
    calculateAmount()
    
  }
  
  const setItemsAmount = (value: number) => {
    if (existingIndex !== -1) {
      if(value){
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
        amount: Math.round(value * 100)
        };
      }else{
        updatedItems.splice(existingIndex, 1)
      }
    } else if(value){
      updatedItems.push({amount: Math.round(value * 100), id, description: ''});
    }
    
    updateGoodwillRequest({
      type: 'updateItems',
      payload: updatedItems,
    });
  }
  
  const setItemsAmountDescription = (value: any) => {
    const updatedItems = items
    const existingIndex = updatedItems.findIndex(item => item.id === id);
    
    if (existingIndex !== -1) {
      if(value){
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          description: value
        };
      }else{
        updatedItems.splice(existingIndex, 1)
      }
    } else if(value){
      updatedItems.push({amount: 0 , id, description: value});
    }
    
    
    updateGoodwillRequest({
      type: 'updateItems',
      payload: updatedItems,
    });
    
  }
  
  const handleDescription = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setItemsAmountDescription(value)
  }
  
  const handleDescriptionItem = () => {
    
    if(goodwillRequest.items[existingIndex]?.amount && !goodwillRequest.items[existingIndex]?.description){
      setDescriptionRequiredError(true)
    }else{
      setDescriptionRequiredError(false)
    }
  }  

  const itemNegative = goodwillRequest.items[existingIndex]?.amount < 0 

  return (
    <tr className={`${handles.detailsRowContainer}`}>
      <td className={`${handles.detailsTdWrapper} pa4 pd4 w-60`}>
        <section
          className={`${handles.productSectionWrapper} ${
            phone ? 'w5' : ''
          }`}
        >
          <div className='flex pa2'>
            <div className={`${handles.returnInfoBodyImgWrapper} mr3`} style={{ flexBasis: '10%' }}>
              <img src={imageUrl} alt="Product" />
            </div>
            <div className={handles.returnInfoReasonConditionWrapper}>
              <p className="b">{name}</p>
      
              <div className="flex">
                <p className="f6 mv0 mr3 gray b ">
                  {' '}{id}{' '}
                </p>
              </div>
              <div className="flex">
                <p className="f6 mv0 gray ">
                   <FormattedMessage id={`return-app.return-goodwill-item-unit-cost`} />{`${getCurrency(amount)}`}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section>
        <div className="mh4 ma4">
          <FormattedMessage id="return-app.goodwill-order-details.page-input.description">
            {(formattedMessage) => (
              <Input
                value = {goodwillRequest.items[existingIndex]?.description ?? ''}
                placeholder={formattedMessage}
                onChange={handleDescription}
              />
            )}
          </FormattedMessage>
          {descriptionRequiredError  ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id={`return-app.return-goodwill-item-description.error`} />
            }
          />
        ) : null}
        </div>        
        </section>      
      </td>
      <td className={`${handles.detailsTdWrapper} pa4 w-60`}>
        <section>
        <div className="mh4">
          <InputCurrency
            value = {goodwillRequest.items[existingIndex]?.amount ? goodwillRequest.items[existingIndex]?.amount / 100 : undefined}
            name="itemAmount"
            required
            currencyCode= 'EUR'
            onChange={handleAmountChange}
          />
        </div>    
        {itemMessageError  ? (
          <CustomMessage
            status="error"
            message={
              <FormattedMessage id={`return-app.return-goodwill-item-value.error${itemNegative ? '-negative' : '' }`} />
            }
          />
        ) : null}
        <p className={`${handles.itemsDetailText} tc`}>
          <FormattedMessage id="return-app.goodwill-order-details.page-input-amount.description" />  { getCurrency(amountAvailablePerItem) }
        </p>
        </section>
      </td>
    </tr>
  )
}
