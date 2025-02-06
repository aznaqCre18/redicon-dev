import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { SupplierData, SupplierType } from 'src/types/apps/supplier'

export const supplierService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<SupplierType> }>('/supplier', {
      params: options
    })
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<SupplierType> }>('/supplier', {
      params: { ...options, status: 'ACTIVE' }
    })
  },

  getOne(id: string) {
    return api.get<{ data: SupplierType }>(`/supplier/${id}`)
  },

  create(request: SupplierData) {
    return api.post('/supplier', request, undefined, true)
  },

  delete(id: string) {
    return api.delete(`/supplier/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/supplier`, ids, undefined, true)
  },
  update(request: { id: string; data: SupplierData }) {
    return api.patch(`/supplier/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/supplier/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/supplier/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  },

  exportExcel() {
    return api.get('/supplier/export', { responseType: 'blob' }, true)
  }
}
