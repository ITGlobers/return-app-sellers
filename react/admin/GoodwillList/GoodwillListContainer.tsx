import React from 'react'

import { OrdersGoodwillContainer } from '../OrderList/OrdersGoodwillContainer'
import { AlertProvider } from '../provider/AlertProvider'

export const AdminGoodwillList = () => {
  return (
    <AlertProvider>
      <OrdersGoodwillContainer action='Goodwill' />
    </AlertProvider>
  )
}
