import { OutletType, OutletData, OutletDetailType } from 'src/types/apps/outlet/outlet'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const outletService = {
  getListOutlet(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OutletType> }>('/product/outlet', {
      params: { ...options, status: 'Active' }
    })
  },

  getListOutletShowDisabled(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OutletType> }>('/product/outlet', {
      params: options
    })
  },

  getOutlet(id: string) {
    return api.get<{ data: OutletDetailType }>(`/product/outlet/${id}`)
  },

  postOutlet(request: OutletData) {
    return api.post('/product/outlet', request)
  },

  deleteOutlet(id: string) {
    return api.delete(`/product/outlet/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/product/outlet`, ids)
  },
  patchOutlet(request: { id: string; data: OutletData }) {
    return api.patch(`/product/outlet/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/outlet/${data.id}`, {
      status: data.status ? 'Active' : 'Inactive'
    })
  },

  setLogo(data: { id: string; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/product/outlet/${data.id}/media`, formData)
  },
  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/product/outlet/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
