import React from 'react'

import { OrdersGoodwillContainer } from '../OrderList/OrdersGoodwillContainer'
import { AlertProvider } from '../provider/AlertProvider'

export const AdminInvoicesList = () => {
  return (
    <AlertProvider>
      <OrdersGoodwillContainer action='Invoice' />
    </AlertProvider>
  )
}
