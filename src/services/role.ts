import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { UserRoleType } from 'src/types/apps/userRoleTypes'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { UserRolePermissionType } from 'src/types/apps/userPermissionType'

export interface patchRole {
  id: string
  request: any
}

export const roleService = {
  getListRole(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<UserRoleType> }>('/user/role', {
      params: options
    })
  },
  postRole(request: any) {
    return api.post('/user/role', request)
  },
  getRole(id: string) {
    return api.get(`/user/role/${id}`)
  },
  deleteRole(id: string) {
    return api.delete(`/user/role/${id}`)
  },
  patchRole(patchUser: patchRole) {
    return api.patch(`/user/role/${patchUser.id}`, patchUser.request)
  },

  getListRolePermission(roleId: number) {
    return api.get<{ meta: MetaType; data: Array<UserRolePermissionType> }>(
      '/user/role-permission?limit=100&page=1&role_id=' + roleId
    )
  },
  postRolePermission(request: any) {
    return api.post('/user/role-permission', request)
  },

  deleteBatchRole(ids: number[]) {
    return api.deleteBatch('/user/role', ids)
  },

  deleteBatchRolePermission(ids: number[]) {
    return api.deleteBatch('/user/role-permission', ids)
  },

  updateStatus(data: { id: number; status: boolean }) {
    return api.patch(`/user/role/${data.id}`, { is_active: data.status ? 'Active' : 'Inactive' })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/user/role/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
