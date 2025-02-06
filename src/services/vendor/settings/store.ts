import {
  StoreSettingApplicationType,
  StoreSettingApplicationData,
  StoreSettingCMSType,
  StoreSettingCMSData,
  StoreCustomerSettingType,
  StoreCustomerSettingData,
  StoreGeneralSettingData
} from 'src/types/apps/vendor/settings/store'
import api from '../../core'

export const storeSettingService = {
  application() {
    return api.get<{ data: StoreSettingApplicationType }>('/vendor/setting/application')
  },

  updateApplication(request: StoreSettingApplicationData) {
    return api.patch<{ status: boolean; message: string }>('/vendor/setting/application', request)
  },

  updateApplicationFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.patch<{ status: boolean; message: string }>(
      '/vendor/setting/application/apk',
      formData
    )
  },

  updateVendorStoreGeneralSetting(request: StoreGeneralSettingData) {
    return api.patch<{ status: boolean; message: string }>('/vendor/setting', request)
  },

  cms() {
    return api.get<{ data: StoreSettingCMSType }>('/vendor/setting/cms/online-store')
  },

  updateCms(request: StoreSettingCMSData) {
    return api.patch<{ status: boolean; message: string }>(
      '/vendor/setting/cms/online-store',
      request
    )
  },

  customer() {
    return api.get<{ data: StoreCustomerSettingType }>('/vendor/setting/customer')
  },

  updateCustomer(request: StoreCustomerSettingData) {
    return api.patch<{ status: boolean; message: string }>('/vendor/setting/customer', request)
  }
}
