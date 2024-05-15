import React from 'react'
import type { IntlFormatters } from 'react-intl'
import { defineMessages, useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { InvoiceState } from '../../provider/OrderToInvoiceReducer'
import { ItemsDetailsInvoice } from './ItemsDetailsInvoice'

interface Props {
  items: ItemToGoodwill[]
  orderId: string
  shipping:number
  invoiceRequest: InvoiceState
  creationDate?: string
  isAdmin?: boolean
}

const CSS_HANDLES = ['itemsListContainer', 'itemsListTheadWrapper'] as const

const desktopOrder = [
  'product',
  'reason',
  'quantity'

]

const mobileOrder = [
  'product',
  'reason',
  'quantity'
]

export const messages = defineMessages({
  product: {
    id: 'return-app.return-order-details.table-header.product',
  },
  'reason': {
    id: 'return-app.return-order-details.table-header.reason',
  },
  'quantity': {
    id: 'return-app.return-order-details.table-header.quantity-to-invoice',
  },
})

const TableHeaderRenderer = (
  formatMessage: IntlFormatters['formatMessage'],
  isAdmin: boolean | undefined
) => {
  return function Header(value: string) {
    return (
    <th className="v-mid pv0 tl bb b--muted-4 normal bg-base bt ph3 z1 pv3-s">
      {formatMessage(isAdmin ? {id: messages[value].id.replace('store', 'admin')} : messages[value])}
    </th>
    )
  }
}

export const ItemsListInvoice = (props: Props) => {
  const { items, creationDate, isAdmin , invoiceRequest , shipping } = props


  const {
    hints: { phone },
  } = useRuntime()

  const { formatMessage } = useIntl()

  const handles = useCssHandles(CSS_HANDLES)

  const TableHeader = TableHeaderRenderer(
    formatMessage,
    isAdmin
  )

  return (
    <table
      className={`${handles.itemsListContainer} w-100`}
      style={{ borderCollapse: 'collapse' }}
    >
      <thead
        className={`${handles.itemsListContainer} w-100 ph4 truncate overflow-x-hidden c-muted-2 f6 `}
      >
        <tr className="w-100 truncate overflow-x-hidden justify-center ">
          {phone
            ? mobileOrder.map((header) => TableHeader(header))
            : desktopOrder.map((header) => TableHeader(header))}
        </tr>
      </thead>
      <tbody className="return-itemsList-body">
        {items.map((item ,) => (
          <ItemsDetailsInvoice
            key={item.id}
            shipping={shipping}
            item={item}
            creationDate={creationDate}
            invoiceRequest= {invoiceRequest}
          />
        ))}
      </tbody>
    </table>
  )
}
