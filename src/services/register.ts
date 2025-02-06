import { RegisterData } from 'src/types/apps/register'
import api from './core'

export const registerService = {
  register(data: RegisterData) {
    return api.post(`/vendor/registration`, {
      ...data,
      name: data.vendor_name
    })
  }
}
