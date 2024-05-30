import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { Item } from '../../../../typings/InvoiceRequest'
import { ItemSummary } from '../../../../typings/Summary'
import { getCurrency } from '../../utils/constants'

interface Props {
  items: ItemSummary[] | undefined
  selectedItems: Item[]
}

const CSS_HANDLES = [
  'returnInfoTableContainer',
  'returnInfoTheadContainer',
  'returnInfoTableText',
  'returnInfoBodyContainer',
  'returnInfoTrBodyWrapper',
  'returnInfoBodyImgWrapper',
  'returnInfoReasonConditionWrapper',
] as const

export const InvoiceInformationTable = ({ items, selectedItems }: Props) => {
  const handles = useCssHandles(CSS_HANDLES)
  const {
    hints: { phone },
  } = useRuntime()

  if (!items) {
    return null
  }

  return (
    <div className="w-100 ba br3 b--muted-4 center">
      <div className="w-100 mt4 pd4">
        <div className="mh3 f4 mb5 fw5">
          <FormattedMessage id="return-app.goodwill-order-details.section-products-resume" />
        </div>
      </div>
      <table className="w-100">
        <thead className="w-100 ph4 truncate overflow-x-hidden c-muted-2 f6">
          <tr className="w-100 truncate overflow-x-hidden">
            <th className="v-mid pv0 tl bb b--muted-4 normal bg-base bt ph3 z1 pv3-s">
              <FormattedMessage id="return-app.return-order-details.table-header.product" />
            </th>
            <th className="v-mid pv0 tl bb b--muted-4 normal bg-base bt ph3 z1 pv3-s">
              <FormattedMessage id="return-app.return-order-details.table-header.quantity-to-return" />
            </th>
            <th className="v-mid pv0 tl bb b--muted-4 normal bg-base bt ph3 z1 pv3-s">
              <FormattedMessage id="return-app.return-order-details.table-header.amount-to-return" />
            </th>
          </tr>
        </thead>
        <tbody className="v-mid">
          {selectedItems.map(({ amount, quantity, description, id }, index) => {
            const item = items.find(item => item.id === id)
            if (!item) return null

            const { image, name, sellerSku } = item
            return (
              <tr key={`${id}-${index}`} className="ph5">
                <td className={`pv5 ${phone ? 'w-80' : 'w-30'}`}>
                  <div className="flex">
                    <div className={`${handles.returnInfoBodyImgWrapper} mr3`} style={{ flexBasis: '20%' }}>
                      <img src={image} alt="Product" />
                    </div>
                    <div className={handles.returnInfoReasonConditionWrapper}>
                      <p className="b">{name}</p>
                      <div className="flex">
                        <p className="f6 mv0 mr3 gray b">{sellerSku}</p>
                      </div>
                      <div className="flex">
                        <p className="f6 mv0 mr3 gray b">
                          <FormattedMessage id="return-app.return-information-table.table-row.p-reason" />
                        </p>
                        <p className="f6 mv0 gray">{description}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`pv5 pa6 ${phone ? 'w-20' : 'w-30'}`}>
                  <p className="f6 mv0 mr3 gray b pa6">{quantity}</p>
                </td>
                <td className={`pv5 ${phone ? 'w-20' : 'w-30'}`}>
                  <b>{getCurrency(amount)}</b>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
