import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  DebtResponse,
  DebtSummaryResponse,
  DebtType,
  AddRepaymentDebtData
} from 'src/types/apps/debt'

export const debtService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: DebtResponse }>('/debt', {
      params: options
    })
  },

  getSummary(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: DebtSummaryResponse }>(
      '/debt/summary',
      {
        params: options
      },
      true
    )
  },

  get(id: number) {
    return api.get<{ data: DebtType }>(`/debt/${id}`)
  },

  addRepaymentDebt(data: AddRepaymentDebtData) {
    return api.post('/debt/pay', data, undefined, true)
  },

  delete(id: number) {
    return api.delete(`/debt/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.delete(`/debt/batch`, { data: { ids } })
  }
}
