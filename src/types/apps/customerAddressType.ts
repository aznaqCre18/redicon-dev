import * as yup from 'yup'
import { DistrictType, ProvinceType, SubDistrictType } from './locationType'

export type CustomerAddressData = {
  customer_id: number
  name: string
  phone: string
  address: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  postal_code: string
  latitude: number | null
  longitude: number | null
  note: string
  label: string
  is_primary: boolean
}

export interface CustomerAddressType extends CustomerAddressData {
  id: number
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export type CustomerAddressDetailType = {
  customer_address: CustomerAddressType
  sub_district: SubDistrictType
  district: DistrictType
  province: ProvinceType
}

export const customerAddressSchema = yup.object<CustomerAddressData>().shape({
  customer_id: yup.number().required(),
  name: yup.string().required().label('Name'),
  phone: yup.string().required().label('Phone'),
  address: yup.string().required().label('Address'),
  country_id: yup.number().required().label('Country'),
  province_id: yup.number().required().label('Province'),
  district_id: yup.number().required().label('District'),
  subdistrict_id: yup.number().required().label('Sub District'),
  postal_code: yup.string().required().label('Postal Code'),
  latitude: yup.number().nullable().label('Latitude'),
  longitude: yup.number().nullable().label('Longitude'),
  note: yup.string().nullable().label('Note'),
  label: yup.string().nullable().label('Label'),
  is_primary: yup.boolean().label('Primary')
})
