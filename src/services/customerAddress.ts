import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { maxLimitPagination, PageOptionRequestType } from 'src/types/pagination/pagination'
import { CustomerAddressData, CustomerAddressType } from 'src/types/apps/customerAddressType'

export const customerAddressService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CustomerAddressType> }>('/customer/address', {
      params: options
    })
  },

  getListByCustomerId(customer_id: number) {
    return api.get<{ meta: MetaType; data: Array<CustomerAddressType> }>('/customer/address', {
      params: { ...maxLimitPagination, customer_id: customer_id }
    })
  },

  post(request: CustomerAddressData) {
    return api.post('/customer/address', {
      ...request,
      is_primary: request.is_primary ? true : false
    })
  },

  patch(req: { id: number; request: CustomerAddressData }) {
    return api.patch(`/customer/address/${req.id}`, req.request)
  },

  get(id: string) {
    return api.get<{ data: CustomerAddressType }>(`/customer/address/${id}`)
  },

  delete(id: string) {
    return api.delete(`/customer/address/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/customer/address`, ids)
  }
}
