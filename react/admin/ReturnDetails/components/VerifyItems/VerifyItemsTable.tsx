import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Table } from 'vtex.styleguide'
import type { ReturnRequestItem } from 'vtex.return-app'

import { verifyItemsTableSchema } from './verifyItemsTableSchema'
import type { RefundItemMap, UpdateItemsChange } from './VerifyItemsPage'

interface Props {
  items: ReturnRequestItem[]
  refundItemsInput: RefundItemMap
  onItemChange: UpdateItemsChange
}

export const VerifyItemsTable = ({
  items,
  refundItemsInput,
  onItemChange,
}: Props) => {
  return (
    <div>
      <h3>
        <FormattedMessage id="admin/return-app.return-request-details.verify-items.table.title.items" />
      </h3>
      <Table
        fullWidth
        fixFirstColumn
        schema={verifyItemsTableSchema(refundItemsInput, onItemChange)}
        items={items}
      />
    </div>
  )
}
