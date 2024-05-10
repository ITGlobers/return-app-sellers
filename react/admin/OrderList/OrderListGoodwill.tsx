import React, { useState } from 'react'
import { OrderDetailResponse, OrdersToGoodwillList } from '../../../typings/OrdertoReturn'
import { FormattedMessage, FormattedDate } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import { Table, Button } from 'vtex.styleguide'

import OrdersTableFilter from './ListTableFilter'

const CSS_HANDLES = ['listTableContainer'] as const

type Operation = 'next' | 'previous'
interface Props {
  action: 'Goodwill' | 'Invoice'
  orders: OrdersToGoodwillList
  handlePagination: (page: number, operation: Operation) => Promise<void>
  refetch: (variables?: any) => Promise<any>
  isLoading: boolean
}

interface RowData {
  rowData: OrderDetailResponse
}

type OrderListTableSchemaProps = {
  navigate: (to: { to: string }) => void
  isSmallScreen: boolean,
  action: 'Goodwill' | 'Invoice'
}

const OrderlListTableSchema = ({
  navigate,
  isSmallScreen,
  action
}: OrderListTableSchemaProps) => {
  const properties = {
    orderId: {
      title: (
        <FormattedMessage id="return-app.request-return-order-list.table-header.order-id" />
      ),
      minWidth: 150,
    },
    customer: {
      title: (
        <FormattedMessage id="return-app.request-return-order-list.table-header.customer" />
      ),
      minWidth: 150,
      cellRenderer: function setCustomer({ rowData }: RowData) {
        return <p>{`${rowData.customer}`}</p>
      },
    },
    creationDate: {
      title: (
        <FormattedMessage id="return-app.request-return-order-list.table-header.creation-date" />
      ),
      cellRenderer: function formatDate({ cellData }: { cellData: string }) {
        return (
          <FormattedDate
            value={cellData}
            day="2-digit"
            month="2-digit"
            year="numeric"
          />
        )
      },
      minWidth: 120,
    },
    selectOrder: {
      title: (
        <FormattedMessage id="return-app.request-return-order-list.table-header.select-order" />
      ),
      cellRenderer: function SelectOrderButton({ rowData }: RowData) {
        return (
          <div>
            <Button
              disabled = { !rowData.hasAmount }
              {...({
                    onClick: () =>
                      navigate({
                        to: action === 'Goodwill' ?  `/admin/app/seller/goodwill/orders/add/${rowData.orderId}` :  `/admin/app/seller/return/orders/add/${rowData.orderId}`   ,
                      }),
                  })}
              variation="tertiary"
              collapseLeft
            >
              <FormattedMessage id="return-app.request-return-order-list.table-header.select-order" />
            </Button>
          </div>
        )
      },
      minWidth: 150,
    },
  }

  const mobileOrder = {
    orderId: null,
    selectOrder: null,
  }

  return {
    properties: isSmallScreen
      ? Object.assign(mobileOrder, properties)
      : properties,
  }
}

export const OrderListGoodwill = ({ orders, handlePagination, refetch, isLoading , action}: Props) => {
  const {
    navigate,
    route: { domain },
    hints: { phone, mobile },
  } = useRuntime()

  const handles = useCssHandles(CSS_HANDLES)

  const isAdmin = domain === 'admin'

  const [fetchMoreState, setFetchMoreState] = useState<'IDLE' | 'LOADING'>(
    'IDLE'
  )

  const { paging } = orders
  const currentPage = paging?.currentPage ?? 1
  const perPage = paging?.perPage ?? 0
  const totalItems = paging?.total ?? 0

  const handlePaginationClick = async (operation: Operation) => {
    if (currentPage === 1 && operation === 'previous') {
      return
    }

    const newPage =
      operation === 'next' ? Number(currentPage) + 1 : Number(currentPage) - 1

    setFetchMoreState('LOADING')
    await handlePagination(newPage, 'next')
    setFetchMoreState('IDLE')
  }

  return (
    <div className={handles.listTableContainer}>
      {mobile && !isAdmin ? null : (
        <OrdersTableFilter
          refetch={refetch}
          loading={isLoading}
          isDisabled={!orders.list?.length}
        />
      )}
      <Table
        fullWidth
        emptyStateLabel={
          <FormattedMessage id="return-app.request-return-order-list.table-empty-state-label.no-orders-available" />
        }
        schema={OrderlListTableSchema({
          navigate,
          isSmallScreen: phone,
          action
        })}
        items={orders.list}
        loading={fetchMoreState === 'LOADING'}
        pagination={{
          onNextClick: () => handlePaginationClick('next'),
          onPrevClick: () => handlePaginationClick('previous'),
          currentItemFrom: perPage * currentPage - perPage + 1,
          currentItemTo:
            perPage * currentPage > totalItems
              ? totalItems
              : perPage * currentPage,
          textOf: (
            <FormattedMessage id="return-app.request-return-order-list.table-pagination.text-of" />
          ),
          totalItems,
        }}
      />
    </div>
  )
}
