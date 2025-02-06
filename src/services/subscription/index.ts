import { SubscriptionType } from 'src/types/apps/subscription'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const subscriptionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<SubscriptionType> }>('/subscription', {
      params: { ...options }
    })
  }
}
