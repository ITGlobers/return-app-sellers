import React from 'react'
import type { RouteComponentProps } from 'react-router'

import { AlertProvider } from './provider/AlertProvider'
import { StoreSettingsProvider } from './provider/StoreSettingsProvider'
import { OrderToInvoiceProvider } from './provider/OrderToInvoiceProvider'
import { CreateInvoice } from './ReturnAdd/CreateInvoice'

type RouteProps = RouteComponentProps<{ orderId: string }>

export const AdminInvoiceAdd = (props: RouteProps) => {
  return (
    <AlertProvider>
        <StoreSettingsProvider>
          <OrderToInvoiceProvider>
            <CreateInvoice {...props} />
          </OrderToInvoiceProvider>
        </StoreSettingsProvider>
    </AlertProvider>
  )
}
