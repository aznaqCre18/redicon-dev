import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { UserRoleType } from 'src/types/apps/userRoleTypes'
import {
  ModuleDetailType,
  RoleModuleGroupResponse,
  RolePermissionData,
  RolePermissionType
} from 'src/types/apps/rbac'

export interface patchRole {
  id: string
  request: any
}

export const rbacService = {
  getListModuleGroup() {
    return api.get<{ meta: MetaType; data: RoleModuleGroupResponse }>(
      '/user/module/v2/group',
      {
        params: {
          show_on_web: true,
          limit: 9999,
          page: 1
        }
      },
      true
    )
  },
  getListModuleDetail() {
    return api.get<{ meta: MetaType; data: Array<ModuleDetailType> }>('/user/module/v2/detail', {
      params: {
        show_on_web: true,
        limit: 9999,
        page: 1
      }
    })
  },
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
    return api.get<{ meta: MetaType; data: Array<RolePermissionType> }>(
      '/user/role-permission/v2',
      {
        params: {
          limit: 9999,
          page: 1,
          role_id: roleId
        }
      }
    )
  },
  postRolePermission(request: RolePermissionData) {
    return api.post('/user/role-permission/v2', request)
  },
  deleteBatchRolePermission(ids: number[]) {
    return api.post('/user/role-permission/v2', ids)
  }
}
