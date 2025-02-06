import api from '../../core'
import { CodSettingType, CodSettingData } from 'src/types/apps/vendor/settings/shipping'

export const vendorSettingShippingService = {
  getCodSetting() {
    return api.get<{ data: CodSettingType }>('/vendor/setting/cash-on-delivery')
  },

  updateCodSetting(request: CodSettingData) {
    return api.patch<{ data: CodSettingType; message: string }>(
      '/vendor/setting/cash-on-delivery',
      request
    )
  },

  updateMediaCodSetting(file: File) {
    const request = new FormData()
    request.append('file', file)

    return api.patchFormData<{ data: CodSettingType; message: string }>(
      '/vendor/setting/cash-on-delivery/media',
      request
    )
  }
}
