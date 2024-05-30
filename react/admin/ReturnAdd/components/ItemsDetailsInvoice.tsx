import React, { useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { NumericStepper } from 'vtex.styleguide'
import { useInvoiceRequest } from '../../hooks/useInvoiceRequest'
import { InvoiceState } from '../../provider/OrderToInvoiceReducer'
import { RenderReasonDropdown } from './RenderReasonDropdown'
import { getCurrency } from '../../utils/constants'
import { FormattedMessage } from 'react-intl'

interface Props {
  item: ItemToGoodwill
  shipping: number
  creationDate?: string
  invoiceRequest: InvoiceState
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

export const ItemsDetailsInvoice = (props: Props) => {
  const {
    creationDate,
    shipping,
    item: {
      goodwill,
      quantity,
      quantityAvailablePerItem,
      isExcluded,
      amountAvailablePerItem,
      amount,
      imageUrl,
      name,
      sellerSku
    },
  invoiceRequest
  } = props

  const {
    hints: { phone },
  } = useRuntime()
   
  const {
    actions: { updateInvoiceRequest , calculateAmount },
  } = useInvoiceRequest()
  
  useEffect(() => {

  }, [invoiceRequest]);
  
  const { items } = invoiceRequest
  const currentItem = items.findIndex(item => item.id === sellerSku);

  const [otherReasonValue, setOtherReasonValue] = useState<string>('');
  const [reasonValue, setReasonValue] = useState<string>('');
  const [formula, setFormula] = useState<number>((invoiceRequest.items[currentItem]?.quantity * amount)-(goodwill/quantity) * invoiceRequest.items[currentItem]?.quantity)
  

  const updatedItems = items
  const existingIndex = updatedItems.findIndex(item => item.id === sellerSku);
  
  const handles = useCssHandles(CSS_HANDLES)

  const handleReasonChange = (reason: string, otherReason = '') => {
    setOtherReasonValue(otherReason)
    setReasonValue(reason)
    if (existingIndex !== -1) {
      if(reason){
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
        amount: Math.round(formula),
        description: reason === 'otherReason' ? otherReason : reason 
        };
      }else{
        updatedItems.splice(existingIndex, 1)
      }
    } else {
      updatedItems.push({quantity:0 , id: sellerSku, description: reason === 'otherReason' ? otherReason : reason, amount: Math.round(formula),});
    }
    updateInvoiceRequest({
      type: 'updateItems',
      payload: updatedItems,
    });
  }

  const handleQuantityChange = (value: number) => {
    let goodwillValue = goodwill
    const total = quantity * amount
    if(total === amountAvailablePerItem){
      goodwillValue = 0
    }
    let newFormula = Math.round((value * amount)-((goodwillValue/quantity) * value))
    if(newFormula < 0) {
      newFormula = 0
    }
    setFormula(newFormula)

    if (existingIndex !== -1) {
      if(value){
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
        amount: Math.round(newFormula),
        quantity: value
        };
      }else{
        updatedItems.splice(existingIndex, 1)
      }
    } else {
      updatedItems.push({quantity: value , id: sellerSku, description: '' , amount: Math.round(newFormula)});
      
    }
    updateInvoiceRequest({
      type: 'updateItems',
      payload: updatedItems,
    });
    calculateAmount(shipping)
  }

  return (
    <tr className={`${handles.detailsRowContainer}`}>
      <td className='w-50'>
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
                  {' '}{sellerSku}{' '}
                </p>
              </div>
              <div className="flex">
                <p className="f6 mv0 gray ">
                  <FormattedMessage id={`return-app.return-goodwill-item-unit-cost`} />{`${getCurrency(amount)}`}
                </p>
              </div>
              <div className="flex">
                <p className="f6 mv0 gray ">
                  <FormattedMessage id={`return-app.return-goodwill-item-amount`} />{`${getCurrency(formula)}`}
                </p>
              </div>
            </div>
          </div>
        </section>
      </td>
      <td className='w-35 pa4 '>
        <div className='pa4'>
          <RenderReasonDropdown
            isExcluded={isExcluded}
            reason={reasonValue}
            otherReason={otherReasonValue}
            onReasonChange={handleReasonChange}
            creationDate={creationDate}
            isAdmin
          />
        </div>  
        <div className='pa4'>
           
        </div> 
      </td>
      <td className='w-35 pa4 '>
        <div className='pa4'>
          <div>
            <NumericStepper
              size="small"
              maxValue={quantityAvailablePerItem}
              value={invoiceRequest.items[currentItem]?.quantity ?? 0}
              onChange={(e: { value: number }) => handleQuantityChange(e.value)}
            />
          </div>
        </div>
        <div className='pa4'>
            <FormattedMessage 
              id="return-app.goodwill-order-details.page-input-amount.description" 
            />
            {getCurrency(amountAvailablePerItem)}
          </div>
      </td>
    </tr>
  )
}
