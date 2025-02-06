import api from '../core'
import { QRISPaymentData } from 'src/types/apps/vendor/qrisPayment'

export const vendorQRISPaymentService = {
  get(outlet_id: number) {
    return api.get<{ data: QRISPaymentData }>('/vendor/qris-payment', {
      params: {
        outlet_id
      }
    })
  },

  update(request: QRISPaymentData) {
    const formData = new FormData()
    formData.append('outlet_id', request.outlet_id.toString())
    if (request.qr_image) {
      formData.append('qr_image', request.qr_image as File)
    }
    formData.append('status', String(request.status))

    return api.patchFormData('/vendor/qris-payment', formData)
  }
}
