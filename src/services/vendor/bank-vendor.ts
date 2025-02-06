import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { BankVendorData, BankVendorType } from 'src/types/apps/vendor/BankVendorType'

export const bankVendorService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BankVendorType> }>('/vendor/bank', {
      params: options
    })
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BankVendorType> }>('/vendor/bank', {
      params: { ...options, is_active: 'Active' }
    })
  },

  post(request: any) {
    return api.post('/vendor/bank', request)
  },

  patch(request: { id: number; data: BankVendorData }) {
    return api.patch(`/vendor/bank/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/vendor/bank/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/bank`, ids)
  },

  setStatus(request: { id: number; status: boolean }) {
    const { id, status } = request

    const statusString = status ? 'Active' : 'Inactive'

    return api.patch(`/vendor/bank/${id}`, { is_active: statusString })
  }
}
