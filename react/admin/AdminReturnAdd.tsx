import React from 'react'
import type { RouteComponentProps } from 'react-router'

import { AlertProvider } from './provider/AlertProvider'
// import { ReturnAddContainer } from './ReturnAdd/ReturnAddContainer'
import { StoreSettingsProvider } from './provider/StoreSettingsProvider'
import { OrderToReturnProvider } from './provider/OrderToReturnProvider'
import { CreateReturnRequest } from './ReturnAdd/CreateReturnRequest'

type RouteProps = RouteComponentProps<{ orderId: string }>

export const AdminReturnAdd = (props: RouteProps) => {
  return (
    <AlertProvider>
      {/* <ReturnAddContainer> */}
        <StoreSettingsProvider>
          <OrderToReturnProvider>
            <CreateReturnRequest {...props} />
          </OrderToReturnProvider>
        </StoreSettingsProvider>
      {/* </ReturnAddContainer> */}
    </AlertProvider>
  )
}
