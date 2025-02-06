import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { VendorProfileModuleType } from 'src/types/apps/vendor/profile'

export const vendorProfileService = {
  getListModule(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<VendorProfileModuleType> }>(
      '/vendor/profile/module',
      {
        params: options
      }
    )
  }
}
