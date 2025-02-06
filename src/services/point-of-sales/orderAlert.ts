import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { OrderAlertData, OrderAlertType } from 'src/types/apps/point-of-sales/orderAlert'

export const posOrderAlertService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OrderAlertType> }>('/order-alert-setting', {
      params: options
    })
  },

  getOne(id: string | null) {
    return api.get<{ data: OrderAlertType[] }>(`/order-alert-setting/${id}`)
  },

  create(request: OrderAlertData) {
    return api.post('/order-alert-setting', request)
  },

  update(request: { id: number; data: OrderAlertData }) {
    return api.patch(`/order-alert-setting/${request.id}`, request.data, undefined, true)
  },

  delete(id: string) {
    return api.delete(`/order-alert-setting/${id}`, undefined, true)
  }
}
