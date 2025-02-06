import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { PromotionBasicData, PromotionBasicType } from 'src/types/apps/promotion/basic'
import { format } from 'date-fns'

export const promotionBasicService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<PromotionBasicType> }>('/promo/basic', {
      params: options
    })
  },

  getOne(id: string | null) {
    return api.get<{ data: PromotionBasicType[] }>(`/promo/basic/${id}`)
  },

  create(request: PromotionBasicData) {
    request.start_date = format(request.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.end_date = format(request.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.post('/promo/basic', request)
  },

  delete(id: string) {
    return api.delete(`/promo/${id}`)
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
  update(request: { id: number; data: PromotionBasicData }) {
    request.data.start_date = format(request.data.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.data.end_date = format(request.data.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.patch(`/promo/basic/${request.id}`, request.data, undefined, true)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/promo/basic/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
