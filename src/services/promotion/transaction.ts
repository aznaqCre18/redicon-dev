import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  PromotionTransactionData,
  PromotionTransactionType
} from 'src/types/apps/promotion/transaction'
import { format } from 'date-fns'

export const promotionTransactionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<PromotionTransactionType> }>(
      '/promo/transaction',
      {
        params: options
      }
    )
  },

  getOne(id: string | null) {
    return api.get<{ data: PromotionTransactionType[] }>(`/promo/transaction/${id}`)
  },

  create(request: PromotionTransactionData) {
    request.start_date = format(request.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.end_date = format(request.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.post('/promo/transaction', request)
  },

  delete(id: string) {
    return api.delete(`/promo/${id}`, undefined, true)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(
      `/promo/bulk-delete`,
      {
        ids
      },
      undefined,
      true
    )
  },
  update(request: { id: number; data: PromotionTransactionData }) {
    request.data.start_date = format(request.data.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.data.end_date = format(request.data.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.patch(`/promo/transaction/${request.id}`, request.data, undefined, true)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/promo/transaction/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
