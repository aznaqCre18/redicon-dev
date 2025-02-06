import { ProvinceType, LocationRequestType } from 'src/types/apps/locationType'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'

export interface patchOutletType {
  id: string
  request: any
}

export const locationProvinceService = {
  getAll(options?: LocationRequestType) {
    return api.get<{ meta: MetaType; data: Array<ProvinceType> }>('/location/province', {
      params: options
    })
  },
  getOne(id: number) {
    return api.get<{ meta: MetaType; data: Array<ProvinceType> }>('/location/province/' + id)
  }
}
