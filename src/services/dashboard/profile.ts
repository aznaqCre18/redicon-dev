import { ProfileType, ProfileData } from 'src/types/apps/dashboard/profile'
import api from '../core'

export type BusinessData = {
  vendor_name: string
  business_type_id: number
  address: string
  subdistrict_id: number
  district_id: number
  province_id: number
  country_id: number
}

export const dashboardProfileService = {
  get() {
    return api.get<{ data: ProfileType }>('/dashboard/profile')
  },

  setBusiness(request: BusinessData) {
    return api.patch<{ message: string }>('/dashboard/profile', request)
  },

  update(request: ProfileData) {
    return api.patch<{ message: string }>('dashboard/profile', request)
  },

  updateLogo(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.patchFormData<{ message: string }>('dashboard/profile/logo', formData)
  }
}
