import {
  ReceiptSettingData,
  ReceiptSettingType
} from 'src/types/apps/vendor/settings/point-of-sales/receipt'
import api from '../../../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const receiptService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ data: ReceiptSettingType[]; meta: MetaType }>(`receipt-settings`, {
      params: options
    })
  },

  getOne(id: string) {
    return api.get<{ data: ReceiptSettingType }>(`receipt-settings/${id}`)
  },

  create(data: ReceiptSettingData) {
    data.outlet_id = Number(data.outlet_id)

    return api.post(`receipt-settings`, data)
  },

  update(request: { id: number; data: ReceiptSettingData }) {
    request.data.outlet_id = Number(request.data.outlet_id)

    return api.patch(`receipt-settings/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`receipt-settings/${id}`)
  }
}
