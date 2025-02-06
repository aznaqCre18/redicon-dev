import {
  GeneralStoreSettingType,
  GeneralStoreSettingData
} from 'src/types/apps/vendor/settings/online-store/general'
import api from '../../../core'

export const generalStoreSettingService = {
  get() {
    return api.get<{ data: GeneralStoreSettingType }>('/vendor/online-store')
  },

  update(request: GeneralStoreSettingData) {
    return api.patch<{ status: boolean; message: string }>('/vendor/online-store', request)
  },

  uploadMediaLogo(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.postFormData<{ data: string }>('/vendor/online-store/update-media-logo', formData)
  },

  uploadMediaFavicon(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.postFormData<{ data: string }>('/vendor/online-store/update-media-favicon', formData)
  }
}
