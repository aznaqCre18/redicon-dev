import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { DurationData, DurationType } from 'src/types/apps/point-of-sales/duration'

export const posDurationService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<DurationType> }>('/duration-setting', {
      params: options
    })
  },

  getOne(id: string | null) {
    return api.get<{ data: DurationType[] }>(`/duration-setting/${id}`)
  },

  create(request: DurationData) {
    return api.post('/duration-setting', request)
  },

  update(request: { id: number; data: any }) {
    return api.patch(`/duration-setting/${request.id}`, request.data, undefined, true)
  },

  delete(id: number) {
    return api.delete(`/duration-setting/${id}`, undefined, true)
  }
}
