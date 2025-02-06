import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { ExpeditionData, ExpeditionType } from 'src/types/apps/vendor/expedition'

export const expeditionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<ExpeditionType> }>('/vendor/expedition', {
      params: options
    })
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<ExpeditionType> }>('/vendor/expedition', {
      params: { ...options, status: 'true' }
    })
  },

  patch(request: { id: number; data: ExpeditionData }) {
    return api.patch(`/vendor/expedition/${request.id}`, request.data)
  },

  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/vendor/expedition/${data.id}`, {
      status: data.status
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/vendor/expedition/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
