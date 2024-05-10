import { useContext } from 'react'

import { OrderToInvoiceContext } from '../provider/OrderToInvoiceProvider'

export const useInvoiceRequest = () => useContext(OrderToInvoiceContext)
