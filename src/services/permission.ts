import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { UserPermissionType } from 'src/types/apps/userPermissionType'

export interface patchRole {
  id: string
  request: any
}

export const permissionService = {
  getListPermission() {
    return api.get<{ meta: MetaType; data: Array<UserPermissionType> }>(
      '/user/permission?limit=100&page=1'
    )
  },
  postpermission(request: any) {
    return api.post('/user/permission', request)
  },
  getpermission(id: string) {
    return api.get(`/user/permission/${id}`)
  },
  deletepermission(id: string) {
    return api.delete(`/user/permission/${id}`)
  },
  patchpermission(patchUser: patchRole) {
    return api.patch(`/user/permission/${patchUser.id}`, patchUser.request)
  }
}
