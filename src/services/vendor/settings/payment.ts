import api from '../../core'
import { MootaSettingData } from 'src/types/apps/vendor/settings/payment'
import { MootaSettingType } from 'src/types/apps/vendor/settings/payment'

export const vendorSettingPaymentService = {
  getMootaSetting() {
    return api.get<{ data: MootaSettingType }>('/vendor/moota-payment')
  },

  updateMootaSetting(request: MootaSettingData) {
    return api.patch<{ data: MootaSettingType; message: string }>('/vendor/moota-payment', request)
  }
  // updateMediaMootaSetting(file: File) {
  //   const request = new FormData()
  //   request.append('file', file)
  //   return api.patchFormData<{ data: MootaSettingType; message: string }>(
  //     '/vendor/setting/moota/media/',
  //     request
  //   )
  // }
}
