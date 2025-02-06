import { BankType } from 'src/types/apps/bankType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'

export const ewalletService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BankType> }>('/ewallet', {
      params: options
    })
  },

  post(request: any) {
    return api.post('/ewallet', request)
  },

  patch(data: BankType) {
    return api.patch(`/ewallet/${data.id}`, data)
  },

  delete(id: number) {
    return api.delete(`/ewallet/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/ewallet`, ids)
  }
}
