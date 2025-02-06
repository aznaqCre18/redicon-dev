import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { ProductExtraData, ProductExtraType } from 'src/types/apps/productExtra'

export const productExtraService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<ProductExtraType> }>('/product/extra', {
      params: options
    })
  },

  post(request: ProductExtraData) {
    return api.post('/product/extra', request)
  },

  patch(req: { id: number; data: ProductExtraData }) {
    return api.patch(`/product/extra/${req.id}`, req.data, undefined, true)
  },

  delete(id: number) {
    return api.delete(`/product/extra/${id}`, undefined, true)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/product/extra/bulk-delete`, { ids }, undefined, true)
  },

  updateStatus(data: { id: number; status: boolean }) {
    return api.patch(
      `/product/extra/${data.id}`,
      {
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
