import * as yup from 'yup'
import { DistrictType, ProvinceType, SubDistrictType } from '../locationType'
import { SubscriptionType } from '../subscription'

export type OutletData = {
  name: string
  phone: string
  description: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  address: string
  email: string | null
  status: 'Active' | 'Inactive'
}

export interface OutletType extends OutletData {
  id: number
  logo: string
  vendor_id: string
  is_default: boolean
  created_at: Date
  updated_at: Date
  expired_at?: Date
}

export interface OutletDetailType {
  outlet: OutletType
  address: {
    province: ProvinceType
    district: DistrictType
    sub_district: SubDistrictType
  }
  subscription: SubscriptionType
}

export const OutletSchema = yup.object<OutletData>().shape({
  name: yup.string().required().label('Outlet Name'),
  phone: yup.string().nullable().label('Phone'),
  description: yup.string().nullable().label('Description'),
  country_id: yup.number().required().label('Country'),
  province_id: yup.number().nullable().label('Province'),
  district_id: yup.number().nullable().label('District'),
  subdistrict_id: yup.number().nullable().label('Subdistrict'),
  address: yup.string().nullable().label('Address'),
  email: yup.string().email().nullable().label('Email')
})
