import {
  TaxServiceChargeData,
  TaxServiceChargeType
} from 'src/types/apps/vendor/settings/point-of-sales/TaxServiceCharge'
import api from '../../../core'

export const taxServiceChargeService = {
  getOne(id: string) {
    return api.get<{ data: TaxServiceChargeType }>(`product/outlet/tax/${id}`)
  },

  update(request: { id: number; data: TaxServiceChargeData }) {
    const req = {
      ...request.data,
      id: [request.id]
    }

    return api.patch(`product/outlet/tax`, req)
  }
}
