import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  PurchaseData,
  PurchaseDataUpdate,
  PurchaseDetailType
} from 'src/types/apps/purchase/purchase'
import { rangeDateNewConvert } from 'src/utils/apiUtils'

export const purchaseService = {
  getList(options?: PageOptionRequestType) {
    options = rangeDateNewConvert(options)

    return api.get<{ meta: MetaType; data: Array<PurchaseDetailType> }>(
      '/purchase/detail',
      {
        params: options
      },
      true
    )
  },

  getOne(id: string | null) {
    return api.get<{ data: PurchaseDetailType[] }>(`/purchase/${id}`)
  },

  create(request: PurchaseData) {
    return api.post('/purchase', request)
  },

  delete(id: string) {
    return api.delete(`/purchase/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/purchase`, ids)
  },
  update(request: { id: string; data: PurchaseDataUpdate }) {
    return api.patch(`/purchase/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/purchase/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
