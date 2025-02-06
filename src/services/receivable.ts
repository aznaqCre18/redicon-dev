import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  ReceivableResponse,
  ReceivableSummaryResponse,
  ReceivableType,
  AddRepaymentReceivableData
} from 'src/types/apps/receivables'

export const receivableService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReceivableResponse }>('/receivable', {
      params: options
    })
  },

  getSummary(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReceivableSummaryResponse }>(
      '/receivable/summary',
      {
        params: options
      },
      true
    )
  },

  get(id: number) {
    return api.get<{ data: ReceivableType }>(`/receivable/${id}`)
  },

  addRepaymentReceivable(data: AddRepaymentReceivableData) {
    return api.post('/receivable/pay', data, undefined, true)
  },

  delete(id: number) {
    return api.delete(`/receivable/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.delete(`/receivable/batch`, { data: { ids } })
  }
}
