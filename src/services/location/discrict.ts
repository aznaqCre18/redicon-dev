import { DistrictType, LocationRequestType } from 'src/types/apps/locationType'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'

export interface patchOutletType {
  id: string
  request: any
}

export const locationDistrictService = {
  getAll(options?: LocationRequestType) {
    return api.get<{ meta: MetaType; data: Array<DistrictType> }>('/location/district', {
      params: options
    })
  },
  getOne(id: number) {
    return api.get<{ meta: MetaType; data: Array<DistrictType> }>('/location/district/' + id)
  }
}
