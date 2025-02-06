import { BusinessType } from 'src/services/bussinesType'
import * as yup from 'yup'
import { DistrictType, ProvinceType, SubDistrictType } from '../locationType'
import { SubscriptionType } from '../subscription'

export type ProfileData = {
  vendor_name: string
  abbreviation: string
  email: string
  business_type_id: number
  address: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  wa1: string
  wa2: string
  wa3: string
}

export interface ProfileType extends ProfileData {
  name: string
  logo: string
  business_type: BusinessType
  province: ProvinceType
  district: DistrictType
  sub_district: SubDistrictType
  subscription: SubscriptionType
}

export const ProfileSchema = yup.object<ProfileData>().shape({
  vendor_name: yup.string().required().label('Vendor Name'),
  abbreviation: yup.string().nullable().label('Short Name').max(10),
  // business_type_id: yup.number().required().label('Business Type'),
  email: yup.string().email().nullable().label('Email'),
  address: yup.string().nullable().label('Address'),
  country_id: yup.number().required().label('Country'),
  province_id: yup.number().required().label('Province'),
  district_id: yup.number().required().label('District'),
  subdistrict_id: yup.number().required().label('Subdistrict'),
  wa1: yup.string().nullable(),
  wa2: yup.string().nullable(),
  wa3: yup.string().nullable()
})
