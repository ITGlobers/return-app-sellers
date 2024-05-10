import { useContext } from 'react'

import { OrderToGoodwillContext } from '../provider/OrderToGoodwillProvider'

export const useGoodwillRequest = () => useContext(OrderToGoodwillContext)
