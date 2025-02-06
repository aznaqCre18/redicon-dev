import { RoundingData, RoundingType } from 'src/types/apps/vendor/settings/point-of-sales/rounding'
import api from '../../../core'

export const roundingService = {
  getOne(id: string) {
    return api.get<{ data: RoundingType[] }>(`rounding-setting`, {
      params: {
        outlet_ids: id
      }
    })
  },

  create(request: RoundingData) {
    const req = {
      ...request
    }

    return api.post(`rounding-setting`, req)
  },

  update(request: { id: number; data: RoundingData }) {
    return api.patch(`rounding-setting/${request.id}`, request.data, undefined, true)
  }
}
