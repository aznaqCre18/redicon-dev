import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  RevenueExpenseGroupData,
  RevenueExpenseGroupType
} from 'src/types/apps/revenueExpenseGroup'

export const revenueExpenseGroupService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: RevenueExpenseGroupType[] }>(
      '/revenue-and-expense-groups',
      {
        params: options
      },
      false
    )
  },

  post(request: RevenueExpenseGroupData) {
    return api.post('/revenue-and-expense-groups', request, undefined, false)
  },

  patch(request: { id: number; data: RevenueExpenseGroupData }) {
    return api.patch(`/revenue-and-expense-groups/${request.id}`, request.data, undefined, false)
  },

  delete(id: number) {
    return api.delete(`/revenue-and-expense-groups/${id}`, undefined, false)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/revenue-and-expense-groups`, ids, undefined, false)
  }
}
