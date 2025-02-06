import api from '../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  AddSubscriptionData,
  OutletSubscriptionDetailType
} from 'src/types/apps/outlet/subscription'

export const outletSubscriptionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OutletSubscriptionDetailType> }>(
      '/product/outlet/subscription/detail',
      {
        params: { ...options }
      }
    )
  },

  add(data: AddSubscriptionData) {
    return api.post('/product/outlet/subscription', data)
  }
}
