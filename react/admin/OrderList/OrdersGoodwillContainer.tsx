
import React, { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageHeader, PageBlock } from 'vtex.styleguide'
import ORDERS_AVAILABLE_TO_GOODWILL from '../graphql/getOrdersAvailableToGoodwill.gql'

import { OrdersToGoodwillList, QueryOrdersAvailableToReturnArgs} from '../../../typings/OrdertoReturn'

import { useQuery } from 'react-apollo'
import { AdminLoader } from '../AdminLoader'
import { OrderListGoodwill } from './OrderListGoodwill'
interface Props {
  action: 'Goodwill' | 'Invoice'
}
export const OrdersGoodwillContainer = ({action} : Props) => {
  const [ordersToReturn, setOrdersToReturn] = useState<OrdersToGoodwillList[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)

  const { data, loading, error, fetchMore, refetch } = useQuery<
      { ordersAvailableToGoodwill: OrdersToGoodwillList },
      QueryOrdersAvailableToReturnArgs
    >(ORDERS_AVAILABLE_TO_GOODWILL, {
      variables: {
        page: 1
      },
      fetchPolicy: 'no-cache',
    })
    
    useEffect(() => {
      if (data) {
        setOrdersToReturn([data.ordersAvailableToGoodwill])
      }
    }, [data])

    const handlePagination = async (
      page: number,
      operation: 'next' | 'previous'
    ): Promise<void> => {
      const alreadyFetched = ordersToReturn.find((ordersItem) => {
        return ordersItem.paging?.currentPage === page
      })
      if (!alreadyFetched) {
        await fetchMore({
          variables: {
            page,
          },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult
  
            setOrdersToReturn((prevState) => [
              ...prevState,
              fetchMoreResult.ordersAvailableToGoodwill,
            ])
  
            setCurrentPage(
              Number(fetchMoreResult.ordersAvailableToGoodwill.paging?.currentPage)
            )
  
            return prevResult
          },
        })
  
        return
      }
  
      operation === 'next' && setCurrentPage(page)
      operation === 'previous' && setCurrentPage(page)
    }
  return (
    <Layout
    fullWidth
    pageHeader={
       <>
       {
        action === 'Goodwill' ? (
          <PageHeader
          title={
            <FormattedMessage id="return-app.goodwill.orders.header" />
          }
          subtitle={
            <FormattedMessage id="return-app.goodwill.orders.header.subtitle" />
          }
          >
          </PageHeader>
        ) : (
          <PageHeader
          title={
            <FormattedMessage id="return-app.invoice.orders.header" />
          }
          subtitle={
            <FormattedMessage id="return-app.invoice.orders.header.subtitle" />
          }
          >
          </PageHeader>
        )
       }
     </>
    }
    > 
    <PageBlock variation="full" fit="fill">
      <>
        {loading || error || !ordersToReturn.length ? (
          <AdminLoader
            loading={loading}
            error={error}
            data={ordersToReturn}
            errorMessages={{
              errorTitle: (
                <FormattedMessage id="admin/return-app.return-request-details.error.title" />
              ),
              errorDescription: (
                <FormattedMessage id="admin/return-app.return-request-details.error.description" />
              ),
            }}
          />
        ) : (
          <OrderListGoodwill
            orders={ordersToReturn[currentPage - 1]}
            handlePagination={handlePagination}
            refetch={refetch}
            isLoading={loading}
            action={action}
          />
        )}
      </>
    </PageBlock>
    </Layout>
  )
}
