import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { PromotionProductData, PromotionProductType } from 'src/types/apps/promotion/product'
import { format } from 'date-fns'

export const promotionProductService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<PromotionProductType> }>('/promo/product', {
      params: options
    })
  },

  getOne(id: string | null) {
    return api.get<{ data: PromotionProductType[] }>(`/promo/product/${id}`)
  },

  create(request: PromotionProductData) {
    request.start_date = format(request.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.end_date = format(request.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.post('/promo/product', request)
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
  update(request: { id: number; data: PromotionProductData }) {
    request.data.start_date = format(request.data.start_date as Date, 'yyyy-MM-dd 07:00:00')
    request.data.end_date = format(request.data.end_date as Date, 'yyyy-MM-dd 07:00:00')

    return api.patch(`/promo/product/${request.id}`, request.data, undefined, true)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/promo/product/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
