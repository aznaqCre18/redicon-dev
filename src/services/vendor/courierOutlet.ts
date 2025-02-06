import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { CourierOutletData, CourierOutletDetailType } from 'src/types/apps/vendor/courierOutlet'

export const courierOutletService = {
  getList(request: { id: number; options?: PageOptionRequestType }) {
    return api.get<{ meta: MetaType; data: Array<CourierOutletDetailType> }>(
      '/vendor/courier-detail/' + request.id,
      {
        params: request.options
      }
    )
  },

  post(request: CourierOutletData) {
    return api.post('/vendor/courier-detail', request)
  },

  patch(request: { id: number; data: CourierOutletData }) {
    return api.patch(`/vendor/courier-detail/${request.id}`, request.data)
  },

  delete(id: number) {
    return api.delete(`/vendor/courier-detail/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/courier-detail`, ids)
  },

  //
  setStatus(data: { id: number; status: boolean }) {
    const status = data.status ? 'Active' : 'Inactive'

    return api.patch(`/vendor/courier-detail/${data.id}`, {
      status: status
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/vendor/courier-detail/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
