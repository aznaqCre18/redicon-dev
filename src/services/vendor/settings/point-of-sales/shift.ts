import { ShiftData, ShiftType } from 'src/types/apps/vendor/settings/point-of-sales/shift'
import api from '../../../core'

export const shiftService = {
  getOne(id: string) {
    return api.get<{ data: ShiftType }>(`shift-setting/${id}`, undefined, true)
  },

  update(request: { id: number; data: ShiftData }) {
    const req = {
      ...request.data,
      outlet_id: request.id
    }

    return api.patch(`shift-setting`, req)
  }
}
