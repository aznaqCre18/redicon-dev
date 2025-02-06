import { BankType } from 'src/types/apps/bankType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'

export const bankService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BankType> }>('/bank', {
      params: options
    })
  },

  post(request: any) {
    return api.post('/bank', request)
  },

  patch(data: BankType) {
    return api.patch(`/bank/${data.id}`, data)
  },

  delete(id: number) {
    return api.delete(`/bank/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/bank`, ids)
  }
}
