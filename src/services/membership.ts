import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { MembershipType } from 'src/types/apps/membershipType'

export const membershipService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<MembershipType> }>('/customer/membership', {
      params: options
    })
  },

  getListMembershipActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<MembershipType> }>('/customer/membership', {
      params: { ...options, is_active: true }
    })
  },

  postItem(request: any) {
    return api.post('/customer/membership', request)
  },
  getItem(id: string) {
    return api.get(`/customer/membership/${id}`)
  },
  deleteItem(id: number) {
    return api.delete(`/customer/membership/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/customer/membership`, ids)
  },

  patchItem(patchData: { id: number; request: any }) {
    return api.patch(`/customer/membership/${patchData.id}`, patchData.request)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/customer/membership/${data.id}`, {
      is_active: data.status
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/customer/membership/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
