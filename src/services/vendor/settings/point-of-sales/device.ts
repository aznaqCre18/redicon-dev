import {
  DeviceData,
  DeviceDetailType,
  DeviceType
} from 'src/types/apps/vendor/settings/point-of-sales/device'
import api from '../../../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const deviceService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<DeviceType> }>('vendor/cashier-access-code', {
      params: options
    })
  },

  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<DeviceDetailType> }>(
      'vendor/cashier-access-code/detail',
      {
        params: options
      }
    )
  },

  getOne(id: string) {
    return api.get<{ data: DeviceType }>(`vendor/cashier-access-code/${id}`)
  },

  create(request: DeviceData) {
    return api.post('vendor/cashier-access-code', request)
  },

  delete(id: number) {
    return api.delete(`vendor/cashier-access-code/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`vendor/cashier-access-code`, ids)
  },
  update(request: { id: number; data: DeviceData }) {
    return api.patch(`vendor/cashier-access-code/${request.id}`, request.data)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`vendor/cashier-access-code/${data.id}`, {
      status: data.status ? 'Active' : 'Inactive'
    })
  },

  logout(id: number) {
    return api.patch(`vendor/cashier-access-code/${id}/logout`)
  }
}
