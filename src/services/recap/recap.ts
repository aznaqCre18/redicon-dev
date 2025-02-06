import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { RecapDetailType, RecapData, RecapDataUpdate } from 'src/types/apps/recap/recap'
import { rangeDateNewConvert } from 'src/utils/apiUtils'

export const recapService = {
  getList(options?: PageOptionRequestType) {
    options = rangeDateNewConvert(options)

    return api.get<{ meta: MetaType; data: Array<RecapDetailType> }>('/recap-invoice-order', {
      params: options
    })
  },

  getOne(id: string | null) {
    return api.get<{ data: RecapDetailType }>(`/recap-invoice-order/${id}`, undefined, true)
  },

  create(request: RecapData) {
    return api.post('/recap-invoice-order', request)
  },

  delete(id: string) {
    return api.delete(`/recap-invoice-order/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/recap-invoice-order`, ids)
  },
  update(request: { id: string; data: RecapDataUpdate }) {
    return api.patch(`/recap-invoice-order/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/recap-invoice-order/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
