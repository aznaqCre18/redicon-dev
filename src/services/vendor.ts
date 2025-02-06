import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { VendorType, VendorRegistrationData, RegistrationResponse } from 'src/types/apps/vendorType'

export interface patchType {
  id: string
  request: any
}

export const vendorService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<VendorType> }>('/vendor', {
      params: options
    })
  },
  postItem(request: any) {
    return api.post('/vendor/', request)
  },
  getItem(id: number) {
    return api.get<{
      data: {
        website: string
      }
    }>(`/vendor/${id}`)
  },
  deleteItem(id: string) {
    return api.delete(`/vendor/${id}`)
  },
  patchItem(patchData: patchType) {
    return api.patch(`/vendor/${patchData.id}`, patchData.request)
  },
  registration(request: VendorRegistrationData) {
    return api.post<{ data: RegistrationResponse }>('/vendor/registration', request)
  },
  checkEmailAvailable(email: string) {
    return api.post(`/vendor/check-email`, {
      email: email
    })
  },
  checkPhoneAvailable(phone: string) {
    return api.post(`/vendor/check-phone`, {
      phone: phone
    })
  },
  sendOtp(data: { phone?: string; email?: string }) {
    let _data = {}
    if (data.phone) {
      _data = { phone: data.phone.replace('+', '') }
    }
    if (data.email) {
      _data = { email: data.email }
    }

    return api.post<{ message: string }>(`/vendor/send-otp`, _data)
  },
  validateOtp(data: { phone?: string; email?: string; code: string }) {
    let _data = {}
    if (data.phone) {
      _data = { phone: data.phone.replace('+', ''), code: data.code }
    }
    if (data.email) {
      _data = { email: data.email, code: data.code }
    }

    return api.post<{ message: string }>(`/vendor/validate-otp`, _data)
  }
}
