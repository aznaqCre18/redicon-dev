import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  ReturnSaleDetailType,
  ReturnSaleData,
  ReturnSaleDataUpdate
} from 'src/types/apps/sale/returnSale'
import { rangeDateNewConvert } from 'src/utils/apiUtils'

export const returnSaleService = {
  getList(options?: PageOptionRequestType) {
    options = rangeDateNewConvert(options)

    return api.get<{ meta: MetaType; data: Array<ReturnSaleDetailType> }>(
      '/return-sales/detail',
      {
        params: options
      },
      true
    )
  },

  getOne(id: string | null) {
    return api.get<{ data: ReturnSaleDetailType[] }>(`/return-sales/${id}`)
  },

  create(request: ReturnSaleData) {
    return api.post('/return-sales', request)
  },

  delete(id: string) {
    return api.delete(`/return-sales/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/return-sales`, ids)
  },
  update(request: { id: string; data: ReturnSaleDataUpdate }) {
    return api.patch(`/return-sales/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/return-sales/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
