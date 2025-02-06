import { OrderPrintSettingType, OrderPrintSettingData } from 'src/types/apps/vendor/settings/order'
import api from '../../core'

export const orderSettingService = {
  getPrintSetting() {
    return api.get<{ data: OrderPrintSettingType }>('/print-setting')
  },

  updatePrintSetting(req: { id: number; data: OrderPrintSettingData }) {
    return api.patch<{ data: OrderPrintSettingType; message: string }>(
      '/print-setting/' + req.id,
      req.data
    )
  }
}
