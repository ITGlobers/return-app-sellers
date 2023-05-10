import { IOClients, Sphinx } from '@vtex/api'

import { Catalog } from './catalog'
import { OMSCustom as OMS } from './oms'
import { GiftCard } from './giftCard'
import Checkout from './checkout'
import { VtexId } from './vtexId'
import { CatalogGQL } from './catalogGQL'
import { Return} from './return'
import { Order} from './orders'
import { Account } from './account'
import { ReturnSettings } from './appSettings'
import { SettingsClient } from './settings'
import { ProfileClient } from './profile'


export class Clients extends IOClients {
  public get oms() {
    return this.getOrSet('oms', OMS)
  }

  public get account() {
    return this.getOrSet('account', Account)
  }
  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get catalogGQL() {
    return this.getOrSet('catalogGQL', CatalogGQL)
  }

  public get giftCard() {
    return this.getOrSet('giftCard', GiftCard)
  }

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get vtexId() {
    return this.getOrSet('vtexId', VtexId)
  }

  public get sphinx() {
    return this.getOrSet('sphinx', Sphinx)
  }

  public get return() {
    return this.getOrSet('return', Return)
  }
  
  public get order() {
    return this.getOrSet('order', Order)
  }

  public get returnSettings() {
    return this.getOrSet('returnSettings', ReturnSettings)
  }

  public get settingsAccount() {
    return this.getOrSet('settingsAccount', SettingsClient)
  }

  public get profile() {
    return this.getOrSet('profile', ProfileClient)
  }
  
}
