import { BrandType } from 'src/types/apps/brandType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'

export const brandService = {
  getListBrand(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BrandType> }>('/product/brand', {
      params: options
    })
  },

  getListBrandActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BrandType> }>('/product/brand', {
      params: { ...options, is_active: true }
    })
  },

  postBrand(request: any) {
    return api.post('/product/brand', request)
  },

  patchBrand(data: BrandType) {
    return api.patch(`/product/brand/${data.id}`, data)
  },

  deleteBrand(id: string) {
    return api.delete(`/product/brand/${id}`)
  },

  deleteBatchBrand(ids: number[]) {
    return api.deleteBatch(`/product/brand`, ids)
  },

  updateImage(data: { id: number; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/product/brand/${data.id}/image`, formData)
  },

  deleteImage(id: number) {
    return api.delete(`/product/brand/${id}/image`)
  },

  updateStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/brand/${data.id}`, { is_active: data.status })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/product/brand/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  },

  exportExcel() {
    return api.get('/product/brand/export', { responseType: 'blob' }, true)
  }
}
