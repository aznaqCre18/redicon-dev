import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  ReturnPurchaseData,
  ReturnPurchaseDataUpdate,
  ReturnPurchaseDetailType
} from 'src/types/apps/purchase/returnPurchase'
import { rangeDateNewConvert } from 'src/utils/apiUtils'

export const purchaseReturnService = {
  getList(options?: PageOptionRequestType) {
    options = rangeDateNewConvert(options)

    return api.get<{ meta: MetaType; data: Array<ReturnPurchaseDetailType> }>(
      '/return-purchase/detail',
      {
        params: options
      },
      true
    )
  },

  getOne(id: string | null) {
    return api.get<{ data: ReturnPurchaseDetailType[] }>(`/return-purchase/${id}`)
  },

  create(request: ReturnPurchaseData) {
    return api.post('/return-purchase', request)
  },

  delete(id: string) {
    return api.delete(`/return-purchase/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/return-purchase`, ids)
  },
  update(request: { id: string; data: ReturnPurchaseDataUpdate }) {
    return api.patch(`/return-purchase/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/return-purchase/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
