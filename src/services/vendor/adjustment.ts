/* eslint-disable @typescript-eslint/no-unused-vars */
import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  AdjustmentData,
  AdjustmentDetailType,
  AdjustmentType
} from 'src/types/apps/vendor/adjustment'

export const adjustmentService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<AdjustmentType> }>('/product/adjustment', {
      params: options
    })
  },

  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<AdjustmentDetailType> }>(
      '/product/adjustment/detail',
      {
        params: options
      }
    )
  },

  post(request: AdjustmentData) {
    return api.post('/product/adjustment', request)
  },

  patch(request: { id: number; data: AdjustmentData }) {
    return api.patch(`/product/adjustment/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/product/adjustment/${id}`, undefined)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/product/adjustment`, ids, undefined)
  },

  mapOutletCreate(data: { adjustment_id: number; outlet_id: number }[]) {
    return api.post('/product/adjustment-outlet-mapping/batch', data)
  },

  deleteOutletMapping(data: { adjustment_id: number; outlet_id: number }[]) {
    return api.deleteBatch(`/product/adjustment-outlet-mapping/batch`, data)
  }
}
