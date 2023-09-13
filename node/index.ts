import type {
  ClientsConfig,
  ServiceContext,
  RecorderState,
  ParamsContext,
} from '@vtex/api'
import { Service, LRUCache, method } from '@vtex/api'

import { Clients } from './clients'
import { mutations, queries, resolvers } from './resolvers'
import { schemaDirectives } from './directives'
import { updateRequestStatus } from './middlewares/updateRequestStatus'
import { errorHandler } from './middlewares/errorHandler'
import { exportReturns } from './middlewares/exportReturns'
import { ping } from './middlewares/ping'
import { keepAlivePing } from './events/keepAlive'

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
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    // Added in the state via graphql directive or auth middleware when request has vtexidclientautcookie
    userProfile?: UserProfile
    // Added in the state via auth middleware when request has appkey and apptoken.
    appkey?: string
  }
}

export default new Service<Clients, State, ParamsContext>({
  clients,
  events: { keepAlivePing },
  routes: {
    ping: method({
      GET: [ping],
    }),
    returnRequest: method({
      PUT: [errorHandler, updateRequestStatus],
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
