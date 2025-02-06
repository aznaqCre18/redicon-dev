import { MetaType } from 'src/types/pagination/meta'
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { SaleDetailType, SaleData, SaleDataUpdate } from 'src/types/apps/sale/sale'
import { rangeDateNewConvert } from 'src/utils/apiUtils'

export const saleService = {
  getList(options?: PageOptionRequestType) {
    options = rangeDateNewConvert(options)

    return api.get<{ meta: MetaType; data: Array<SaleDetailType> }>(
      '/sales/detail',
      {
        params: options
      },
      true
    )
  },

  getOne(id: string | null) {
    return api.get<{ data: SaleDetailType }>(`/sales/${id}`)
  },

  create(request: SaleData) {
    return api.post('/sales', request)
  },

  delete(id: string) {
    return api.delete(`/sales/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/sales`, ids)
  },
  update(request: { id: string; data: SaleDataUpdate }) {
    return api.patch(`/sales/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/sales/${data.id}`, {
      status: data.status ? 'ACTIVE' : 'INACTIVE'
    })
  }
}
