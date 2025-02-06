import { AddressStoreData, AddressStoreDetailType } from 'src/types/apps/vendor/settings/store'
import api from '../core'

export const vendorStoreAddressService = {
  getAddress() {
    return api.get<{ data: AddressStoreDetailType }>('/vendor/online-store')
  },

  setAddress(request: AddressStoreData) {
    return api.patch<{ message: string }>('/vendor/online-store', request)
  }
}
