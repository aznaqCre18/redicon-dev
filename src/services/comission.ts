import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import {
  CommissionData,
  CommissionDetailType
  // helperExtractProductIds,
  // helperExtractProuductVariantIds
} from 'src/types/apps/commission'

export const commissionService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CommissionDetailType> }>('/commissions', {
      params: options
    })
  },

  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CommissionDetailType> }>('/commissions', {
      params: { ...options, active_status: true }
    })
  },

  getOne(id: number) {
    return api.get<{ data: CommissionDetailType }>(`/commissions/${id}`, undefined, true)
  },

  create(request: CommissionData) {
    return api.post('/commissions', {
      ...request,
      product_ids: request.product_ids
        ? request.product_ids.map(item => parseInt(item.toString()))
        : [],
      product_variant_ids: request.product_variant_ids
        ? request.product_variant_ids.map(item => parseInt(item.toString()))
        : [],
      option_value: request.option_value,
      product_type: 'goods'
    })
  },

  delete(id: number) {
    return api.delete(`/commissions/${id}`, undefined, true)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(
      `/commissions/bulk-delete`,
      {
        ids
      },
      undefined,
      true
    )
  },
  update(request: { id: number; data: CommissionData }) {
    return api.patch(
      `/commissions/${request.id}`,
      {
        ...request.data,
        option_value: request.data.option_value,
        product_ids: request.data.product_ids
          ? request.data.product_ids.map(item => parseInt(item.toString()))
          : [],
        product_variant_ids: request.data.product_variant_ids
          ? request.data.product_variant_ids.map(item => parseInt(item.toString()))
          : [],
        product_type: 'goods'
      },
      undefined,
      true
    )
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(
      `/commissions/${data.id}`,
      {
        active_status: data.status
      },
      undefined,
      true
    )
  }
}
