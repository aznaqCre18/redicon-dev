import api from '../core'
import { DanaPaymentData } from 'src/types/apps/vendor/danaPayment'

export const vendorDanaPaymentService = {
  get(outlet_id: number) {
    return api.get<{ data: DanaPaymentData }>('/vendor/dana-payment', {
      params: {
        outlet_id
      }
    })
  },

  update(request: DanaPaymentData) {
    return api.patch('/vendor/dana-payment', request)
  }
}
