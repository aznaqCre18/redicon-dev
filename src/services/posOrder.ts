import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { OrderCartDetailType } from 'src/types/apps/posOrder'

export interface patchRole {
  id: string
  request: any
}

export const posOrderService = {
  getListCartDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OrderCartDetailType> }>('/order/cart/detail', {
      params: { ...options }
    })
  },
  getOne(id: string) {
    return api.get<{ data: Array<OrderCartDetailType> }>(`/order/cart/${id}/detail`)
  }
}
