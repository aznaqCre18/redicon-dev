import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { UnitType } from 'src/types/apps/unitType'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export interface patchBrandType {
  id: string
  request: any
}

export const unitService = {
  getListUnit(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<UnitType> }>('/product/unit', {
      params: options
    })
  },

  getListUnitActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<UnitType> }>('/product/unit', {
      params: { ...options, is_active: true }
    })
  },

  getUnit(id: number) {
    return api.get<{ data: UnitType }>(`/product/unit/${id}`)
  },

  postUnit(request: any) {
    return api.post('/product/unit', request)
  },

  patchUnit(data: UnitType) {
    return api.patch(`/product/unit/${data.id}`, data)
  },

  deleteUnit(id: string) {
    return api.delete(`/product/unit/${id}`)
  },

  deleteBatchUnit(ids: number[]) {
    return api.deleteBatch(`/product/unit`, ids)
  },

  updateStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/unit/${data.id}`, { is_active: data.status })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/product/unit/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  },

  exportExcel() {
    return api.get('/product/unit/export', { responseType: 'blob' }, true)
  }
}
