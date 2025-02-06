import {
  SubDistrictRequestType,
  SubDistrictDetailType,
  SubDistrictType
} from 'src/types/apps/locationType'
import api from './core'
import { MetaType } from 'src/types/pagination/meta'

export interface patchOutletType {
  id: string
  request: any
}

export const locationService = {
  getSubDistrict(options?: SubDistrictRequestType) {
    return api.get<{ meta: MetaType; data: Array<SubDistrictDetailType> }>(
      '/location/subdistrict/detail',
      {
        params: options
      }
    )
  },
  getOneSubDistrict(id: number) {
    return api.get<{ data: SubDistrictDetailType }>('/location/subdistrict/detail/' + id)
  },
  getOneProvince(id: number) {
    return api.get<{ meta: MetaType; data: Array<SubDistrictType> }>('/location/province/' + id)
  }
}
