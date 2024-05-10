import React from 'react'
import type { RouteComponentProps } from 'react-router'

import { AlertProvider } from './provider/AlertProvider'
// import { ReturnAddContainer } from './ReturnAdd/ReturnAddContainer'
import { StoreSettingsProvider } from './provider/StoreSettingsProvider'
import { OrderToGoodwillProvider } from './provider/OrderToGoodwillProvider'
import { CreateGoodwill } from './ReturnAdd/CreateGoodwill'

type RouteProps = RouteComponentProps<{ orderId: string }>

export const AdminGoodwillAdd = (props: RouteProps) => {
  return (
    <AlertProvider>
        <StoreSettingsProvider>
          <OrderToGoodwillProvider>
            <CreateGoodwill {...props} />
          </OrderToGoodwillProvider>
        </StoreSettingsProvider>
    </AlertProvider>
  )
}
