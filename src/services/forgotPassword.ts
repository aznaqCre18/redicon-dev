import { ResetPasswordData } from 'src/types/apps/vendorType'
import api from './core'

export const forgorPasswordService = {
  sendOtp(data: { phone?: string; email?: string }) {
    let _data = {}
    if (data.phone) {
      _data = { phone: data.phone.replace('+', '') }
    }
    if (data.email) {
      _data = { email: data.email }
    }

    return api.post<{ message: string }>(`/user/reset-password`, _data)
  },
  validateOtp(data: { phone?: string; email?: string; otp: string }) {
    let _data = {}
    if (data.phone) {
      _data = { phone: data.phone, otp: data.otp }
    }
    if (data.email) {
      _data = { email: data.email, otp: data.otp }
    }

    return api.post<{ message: string; data: { code: string } }>(
      `user/reset-password/verification-otp`,
      _data
    )
  },
  reset(data: ResetPasswordData) {
    const _data = {
      email: data.email == '' ? undefined : data.email,
      phone: data.phone == '' ? undefined : data.phone,
      code: data.code,
      new_password: data.new_password,
      new_password_confirmation: data.new_password_confirmation
    }

    return api.post<{ message: string }>(`user/reset-password/reset`, _data)
  }
}
