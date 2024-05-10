import React, { useEffect, useState } from 'react'
import type { RouteComponentProps } from 'react-router'
import { useQuery } from 'react-apollo'

import { PageHeader, PageBlock } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { StoreSettingsProvider } from '../provider/StoreSettingsProvider'
import ORDER_TO_GOODWILL_SUMMARY from '../graphql/getOrderSummary.gql'
import { OrderDetailsLoader } from './components/loaders/OrderDetailsLoader'
import { OrderSummary, QueryOrderSummaryArgs } from '../../../typings/Summary'
import { OrderToInvoiceProvider } from '../provider/OrderToInvoiceProvider'
import { formatItemsToGoodwill } from '../utils/formatItemsToGoodwill'
import { useInvoiceRequest } from '../hooks/useInvoiceRequest'
import { InvoiceDetails } from './components/InvoiceDetails'
import { ConfirmAndSubmitInvoice } from './components/ConfirmAndSubmitInvoice'

export type Page = 'form-details' | 'submit-form'

type RouteProps = RouteComponentProps<{ orderId: string }>

export const CreateInvoice = (props: any) => {
  const orderId = props?.match?.params?.orderId || props?.params?.orderId
  
  const isAdmin = props?.page ? true : false
  
  const [page, setPage] = useState<Page>('form-details')
  const [items, setItemsToGoodwill] = useState<ItemToGoodwill[]>([])
  
  const { navigate } = useRuntime()
  
  const { data, loading, error } = useQuery<
  { orderSummary: OrderSummary },
  QueryOrderSummaryArgs
  >(ORDER_TO_GOODWILL_SUMMARY, {
    variables: { orderId },
    skip: !orderId,
    fetchPolicy: 'no-cache',
  })
  
  const handlePageChange = (selectedPage: Page) => {
    setPage(selectedPage)
  }

  const createPageHeaderProps = (page: Page, navigate: any, isAdmin: boolean ) => {
  if (page === 'submit-form') {
    return {
      title: (
        <FormattedMessage id={`return-app.confirm-and-submit-invoice.page-header.title`} />
      ),
      linkLabel: (
      <FormattedMessage id={`return-app.return-order-details.page-header.link-goodwill`} />
      ),
      onLinkClick: () => {
        handlePageChange('form-details')
      },
    }
  }

  return {
    title: (
      <FormattedMessage id={`return-app.invoice-order-details.page-header.title`} />
    ),
    linkLabel: (
      <FormattedMessage id={`return-app.return-order-details.page-header.link`} />
    ),
    onLinkClick: () => {
      navigate({
        to: isAdmin ? '/admin/app/seller/return/' : '#/my-returns/add',
      })
    },
  }
  }
 
  useEffect(() => {
    if (!data ) {
      return
    }
    const { orderSummary } = data
    const ItemToGoodwill = formatItemsToGoodwill(orderSummary)
    
    setItemsToGoodwill(ItemToGoodwill)

  }, [data ])

  const {
    invoiceRequest,
    actions: {updateInvoiceRequest}
  } =   useInvoiceRequest()
  
  const payload = {
    type: 'Input',
    description: '',
    issuanceDate: new Date().toISOString(),
    invoiceNumber: '',
    invoiceValue: 0,
    items: [],
    shippingCost:0,
    invoiceKey: JSON.stringify({ preRefund: false }),
  }

  useEffect(() => {
    updateInvoiceRequest({
      type: 'clearState',
      payload
    })
  }, []);
  
  return (
    <div className="create-return-request__container">
      <PageBlock>
        <PageHeader {...createPageHeaderProps(page, navigate, isAdmin)} />
        <OrderDetailsLoader data={{ loading, error }}>
          {page === 'form-details' && data ? (
            <>
              <InvoiceDetails
                {...props}
                onPageChange={handlePageChange}
                items={items}
                creationDate={data.orderSummary.creationDate}
                amountsAvailable = {data.orderSummary.amountsAvailable}
                invoiceRequest = {invoiceRequest} 
              />
            </>
          ) : null}
          {page === 'submit-form' ? (
            <ConfirmAndSubmitInvoice
              onPageChange={handlePageChange} data={data?.orderSummary} invoiceRequest = {invoiceRequest} orderId={orderId} />
          ) : null}
        </OrderDetailsLoader>
      </PageBlock>
    </div>
  )
}

export const CreateInvoiceContainer = (props: RouteProps) => {
  return (
    <StoreSettingsProvider>
      <OrderToInvoiceProvider>
        <CreateInvoice {...props} />
      </OrderToInvoiceProvider>
    </StoreSettingsProvider>
  )
}
