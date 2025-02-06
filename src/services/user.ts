import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { UserDetailType, UserType } from 'src/types/apps/userTypes'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export interface patchUserType {
  id: string
  request: any
}

export const userService = {
  getListUserActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<UserType> }>('/user', {
      params: { ...options, status: 'Active' }
    })
  },

  getListUser(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<UserDetailType> }>('/user/detail', {
      params: options
    })
  },

  postUser(request: any) {
    return api.post('/user', request)
  },
  getUser(id: string) {
    return api.get<{ data: UserDetailType }>(`/user/${id}/detail`)
  },
  deleteUser(id: string) {
    return api.delete(`/user/${id}`)
  },
  deleteBatchUser(ids: number[]) {
    return api.deleteBatch('/user', ids)
  },
  patchUser(patchUser: patchUserType) {
    return api.patch(`/user/${patchUser.id}`, patchUser.request)
  },
  updateImage(data: { id: number; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/user/${data.id}/image`, formData)
  },
  deleteImage(id: number) {
    return api.delete(`/user/${id}/image`)
  },

  setStatus(data: { id: number; status: string }) {
    return api.patch(`/user/${data.id}`, {
      status: data.status
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/user/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
