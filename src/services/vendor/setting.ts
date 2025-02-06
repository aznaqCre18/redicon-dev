import {
  VendorSettingType,
  VendorProductSettingData,
  VendorStoreFeatureSettingData,
  VendorTaxSettingData,
  VendorOrderSettingData
} from 'src/types/apps/vendor/setting'
import api from '../core'

export const vendorSettingService = {
  getVendorSetting() {
    return api.get<{ data: VendorSettingType }>('/product/setting')
  },

  updateProductSetting(request: VendorProductSettingData) {
    return api.patch('/vendor/setting', request)
  },

  updateStoreFeatureSetting(request: VendorStoreFeatureSettingData) {
    return api.patch('/vendor/setting', request)
  },

  updateTaxSetting(request: VendorTaxSettingData) {
    return api.patch('/vendor/setting', request)
  },

  updateOrderStoreSetting(request: VendorOrderSettingData) {
    return api.patch<{ status: boolean; message: string }>('/vendor/setting', request)
  }
}
