import { AddressDetailType } from 'src/types/apps/address'
import * as yup from 'yup'

export interface GeneralStoreSettingType {
  address: AddressDetailType
  online_store: GeneralStoreSettingData & {
    logo?: string
    favicon?: string
    id: number
    vendor_id: number
    created_at: string
    created_by: string | null
    updated_at: string
    updated_by: string | null
  }
}

export interface GeneralStoreSettingData {
  website_color: string
  title: string
  slogan: string
  email: string
  wa1: string
  wa2: string
  wa3: string
  socmed_fb: string
  socmed_x: string
  socmed_ig: string
  socmed_tt: string
  socmed_yt: string
  socmed_other: string
  mp_shopee: string
  mp_tokopedia: string
  mp_olx: string
  mp_blibli: string
  mp_bukalapak: string
  mp_other: string
  mp_lazada: string
  url_playstore: string
  url_appstore: string
  is_web_maintenance: boolean
  is_android_maintenance: boolean
  is_ios_maintenance: boolean
  maintenance_text: string

  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  address: string

  theme_type: string
}

export const GeneralStoreSettingSchema = yup.object<GeneralStoreSettingData>().shape({
  website_color: yup.string().required().label('Website Color'),
  title: yup.string().required().label('Title'),
  slogan: yup.string().required().label('Slogan'),
  email: yup.string().required().email().label('Email'),
  wa1: yup.string().required().label('WA1'),
  wa2: yup.string().nullable().label('WA2'),
  wa3: yup.string().nullable().label('WA3'),
  socmed_fb: yup.string().nullable().label('Socmed FB'),
  socmed_x: yup.string().nullable().label('Socmed X'),
  socmed_ig: yup.string().nullable().label('Socmed IG'),
  socmed_tt: yup.string().nullable().label('Socmed TT'),
  socmed_yt: yup.string().nullable().label('Socmed TY'),
  socmed_other: yup.string().nullable().label('Socmed Other'),
  mp_shopee: yup.string().nullable().label('Mp Shopee'),
  mp_tokopedia: yup.string().nullable().label('Mp Tokopedia'),
  mp_olx: yup.string().nullable().label('Mp Olx'),
  mp_blibli: yup.string().nullable().label('Mp Blibli'),
  mp_bukalapak: yup.string().nullable().label('Mp Bukalapak'),
  mp_other: yup.string().nullable().label('Mp Other'),
  mp_lazada: yup.string().nullable().label('Mp Lazada'),
  url_playstore: yup.string().nullable().label('Url Playstore'),
  url_appstore: yup.string().nullable().label('Url Appstore'),
  is_web_maintenance: yup.boolean().required().label('Is Web Maintenance'),
  is_android_maintenance: yup.boolean().required().label('Is Android Maintenance'),
  is_ios_maintenance: yup.boolean().required().label('Is Ios Maintenance'),
  maintenance_text: yup.string().nullable().label('Maintenance Text'),

  country_id: yup.number().nullable().label('Country'),
  province_id: yup.number().nullable().label('Province'),
  district_id: yup.number().nullable().label('District'),
  subdistrict_id: yup.number().nullable().label('Subdistrict'),
  address: yup.string().required().label('Address'),

  theme_type: yup.string().required().label('Theme Type')
})
