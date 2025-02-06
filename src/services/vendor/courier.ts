import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { CourierData, CourierType } from 'src/types/apps/vendor/courier'

export const courierService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CourierType> }>('/vendor/courier', {
      params: options
    })
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CourierType> }>('/vendor/courier', {
      params: { ...options, is_active: 'Active' }
    })
  },

  post(request: CourierData) {
    return api.post('/vendor/courier', request)
  },

  patch(request: { id: number; data: CourierData }) {
    return api.patch(`/vendor/courier/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/vendor/courier/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/courier`, ids)
  }
}
