import { CategoriesDetailType, CategoryType, CategoryData } from 'src/types/apps/categoryType'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import { MetaType } from 'src/types/pagination/meta'

export const categoryService = {
  getListCategoriesDetail(options?: PageOptionRequestType) {
    return api.get<{ data: CategoriesDetailType[] }>('/product/category/detail', {
      params: options
    })
  },

  getListCategoriesDetailActive(options?: PageOptionRequestType) {
    return api.get<{ data: CategoriesDetailType[] }>('/product/category/detail', {
      params: { ...options, is_active: true }
    })
  },

  getListCategory() {
    return api.get<{ data: CategoryType[] }>('/product/category')
  },

  getListCategoryActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: CategoryType[] }>('/product/category', {
      params: { ...options, is_active: true }
    })
  },

  postCategory(data: CategoryData) {
    return api.post('/product/category', data)
  },

  deleteCategory(id: number) {
    return api.delete('/product/category/' + id)
  },
  deleteBatchCategory(ids: number[]) {
    return api.deleteBatch(`/product/category`, ids)
  },

  patchCategory(data: { id: number; data: CategoryData }) {
    return api.patch('/product/category/' + data.id, data.data)
  },

  updateImage(data: { id: number; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/product/category/${data.id}/image`, formData)
  },

  deleteImage(id: number) {
    return api.delete(`/product/category/${id}/image`)
  },

  updateStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/category/${data.id}`, { is_active: data.status })
  },

  updateShowOnPOS(data: { id: number; status: boolean }) {
    return api.patch(`/product/category/${data.id}`, { is_show_on_pos: data.status })
  },

  bulkMappingOutlet(data: { category_id: number; outlet_ids: number[] }) {
    return api.post(`/product/product-category-outlet-mapping/bulk`, data)
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/product/category/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  },

  exportExcel() {
    return api.get('/product/category/export', { responseType: 'blob' }, true)
  }
}
