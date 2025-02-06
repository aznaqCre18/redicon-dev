import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  RevenueExpenseData,
  RevenueExpenseDetailType,
  RevenueExpenseType
} from 'src/types/apps/revenueExpense'
import { addHours } from 'date-fns'

export const revenueExpenseService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: RevenueExpenseDetailType }>(
      '/revenue-and-expenses/detail',
      {
        params: options
      },
      true
    )
  },

  get(id: number) {
    return api.get<{ data: RevenueExpenseType }>(`/revenue-and-expenses/${id}`)
  },

  post(request: RevenueExpenseData) {
    request.date = addHours(request.date, 7)

    return api.post('/revenue-and-expenses', request)
  },

  patch(request: { data: RevenueExpenseData; id: number }) {
    request.data.date = addHours(request.data.date, 7)

    return api.patch(`/revenue-and-expenses/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/revenue-and-expenses/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/revenue-and-expenses`, ids)
  },

  uploadMedia(request: { file: File; id: number }) {
    const formData = new FormData()
    formData.append('file', request.file)

    return api.patchFormData(`/revenue-and-expenses/${request.id}/media`, formData, undefined, true)
  }
}
