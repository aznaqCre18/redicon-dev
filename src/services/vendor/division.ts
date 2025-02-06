import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { DivisionData, DivisionDetailType, DivisionType } from 'src/types/apps/vendor/division'

export const divisionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<DivisionType> }>(
      '/order/division/',
      {
        params: options
      },
      true
    )
  },

  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<DivisionDetailType> }>('/order/division/detail', {
      params: options
    })
  },

  post(request: DivisionData) {
    return api.post('/order/division', request)
  },

  patch(request: { id: number; data: DivisionData }) {
    return api.patch(`/order/division/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/order/division/${id}`, undefined)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/order/division`, ids, undefined)
  },

  mapOutletCreate(data: { division_id: number; outlet_id: number }[]) {
    return api.post('/order/division-outlet-mapping/batch', data)
  },

  deleteOutletMapping(data: { division_id: number; outlet_id: number }[]) {
    return api.deleteBatch(`/order/division-outlet-mapping/batch`, data)
  }
}
