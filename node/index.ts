import type { ClientsConfig, RecorderState, ParamsContext } from '@vtex/api'
import { Service, LRUCache, method } from '@vtex/api'

import { Clients } from './clients'
import { mutations, queries, resolvers } from './resolvers'
import { schemaDirectives } from './directives'
import { updateRequestStatus } from './middlewares/updateRequestStatus'
import { errorHandler } from './middlewares/errorHandler'
import { exportReturns } from './middlewares/exportReturns'
import { ping } from './middlewares/ping'
import { auth } from './middlewares/auth'
import { createGoodwill } from './middlewares/goodwill/createGoodwill'
import { getGoodwills } from './middlewares/goodwill/getGoodwills'
import { invoice } from './middlewares/invoice'
import { onAppsInstalled } from './events/keepAlive'

const TIMEOUT_MS = 10000
const catalogMemoryCache = new LRUCache<string, any>({ max: 5000 })

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    catalog: {
      memoryCache: catalogMemoryCache,
    },
  },
}

declare global {
  interface State extends RecorderState {
    // Added in the state via graphql directive or auth middleware when request has vtexidclientautcookie
    userProfile?: UserProfile
    // Added in the state via auth middleware when request has appkey and apptoken.
    appkey?: string
  }
}

export default new Service<Clients, State, ParamsContext>({
  clients,
  events: {
    keepALive: onAppsInstalled,
  },
  routes: {
    ping: method({
      POST: [ping],
    }),
    returnRequest: method({
      PUT: [errorHandler, updateRequestStatus],
    }),
    goodwill: method({
      POST: [errorHandler, auth, createGoodwill],
      GET: [errorHandler, auth, getGoodwills],
    }),
    invoice: method({
      POST: [errorHandler, auth, invoice],
    }),
    exportReturns: method({
      GET: [errorHandler, exportReturns],
    }),
  },
  graphql: {
    resolvers: {
      ...resolvers,
      Mutation: {
        ...mutations,
      },
      Query: {
        ...queries,
      },
    },
    schemaDirectives: {
      ...schemaDirectives,
    },
  },
})
