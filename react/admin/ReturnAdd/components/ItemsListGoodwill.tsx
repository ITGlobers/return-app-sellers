import React from 'react'
import type { IntlFormatters } from 'react-intl'
import { defineMessages, useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { ItemsDetailsGoodwill } from './ItemsDetailsGoodwill'
import { OrderSummaryState } from '../../provider/OrderToGoodwillReducer'

interface Props {
  items: ItemToGoodwill[]
  goodwillRequest: OrderSummaryState
  isAdmin?: boolean
}

const CSS_HANDLES = ['itemsListContainer', 'itemsListTheadWrapper'] as const

const desktopOrder = [
  'product',
  'amount-to-return',

]

const mobileOrder = [
  'product',
  'amount-to-return',
]

export const messages = defineMessages({
  product: {
    id: 'return-app.return-order-details.table-header.product',
  },
  'amount-to-return': {
    id: 'return-app.return-order-details.table-header.amount-to-goodwill',
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

export const ItemsListGoodwill = (props: Props) => {
  const { items, isAdmin ,  goodwillRequest } = props


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
        className={`${handles.itemsListContainer} w-100 ph4 truncate overflow-x-hidden c-muted-2 f6`}
      >
        <tr className="w-100 truncate overflow-x-hidden">
          {phone
            ? mobileOrder.map((header) => TableHeader(header))
            : desktopOrder.map((header) => TableHeader(header))}
        </tr>
      </thead>
      <tbody className="v-mid return-itemsList-body">
        {items.map((item ,) => (
          <ItemsDetailsGoodwill
            key={item.id}
            item={item}
            goodwillRequest= {goodwillRequest}
          />
        ))}
      </tbody>
    </table>
  )
}
