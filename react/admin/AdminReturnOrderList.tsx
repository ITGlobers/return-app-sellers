import React from 'react'
import { OrderListContainer } from './OrderList/OrderListContainer'

import { AlertProvider } from './provider/AlertProvider'

export const AdminOrderList = () => {
  return (
    <AlertProvider>
      <OrderListContainer />
    </AlertProvider>
  )
}
