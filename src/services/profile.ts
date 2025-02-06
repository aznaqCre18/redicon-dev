import api from './core'
import {
  ChangePasswordType,
  ChangePinType,
  ProfilPermissionType,
  ProfilPermissionV2Type,
  ProfileDataType,
  ProfileType
} from 'src/types/apps/profileType'

export const profileService = {
  getProfile() {
    return api.get<{ data: ProfileDataType }>('/user/profile')
  },

  getProfilePermission() {
    return api.get<{ data: ProfilPermissionType[] }>('/user/profile/permission')
  },
  getProfilePermissionV2() {
    return api.get<{ data: ProfilPermissionV2Type[] }>('/user/profile/permission/v2')
  },

  updateProfile(data: ProfileType) {
    return api.patch(`/user/profile`, data)
  },

  updatePassword(data: ChangePasswordType) {
    return api.patch('/user/profile/password', data)
  },

  updatePin(data: ChangePinType) {
    return api.patch('/user/profile/pin', data)
  },

  updateProfilePicture(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.patchFormData(`/user/profile/picture`, formData)
  },

  deleteProfilePicture() {
    return api.delete('/user/profile/picture')
  }
}
