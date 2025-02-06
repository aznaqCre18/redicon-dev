import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  PaymentMethodNonCashData,
  PaymentMethodNonCashType
} from 'src/types/apps/vendor/PaymentMethodNonCash'

export const paymentMethodNonCashService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<PaymentMethodNonCashType> }>(
      '/vendor/payment-method-non-cash',
      {
        params: options
      }
    )
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<PaymentMethodNonCashType> }>(
      '/vendor/payment-method-non-cash',
      {
        params: { ...options, status: true }
      }
    )
  },

  post(request: any) {
    return api.post('/vendor/payment-method-non-cash', request)
  },

  patch(request: { id: number; data: PaymentMethodNonCashData }) {
    return api.patch(`/vendor/payment-method-non-cash/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/vendor/payment-method-non-cash/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/payment-method-non-cash`, ids)
  },

  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/vendor/payment-method-non-cash/${data.id}`, {
      status: data.status
    })
  }
}
