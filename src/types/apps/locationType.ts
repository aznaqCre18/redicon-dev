import { PageOptionRequestType } from '../pagination/pagination'

export type ProvinceType = {
  id: number
  country_id: number
  name: string
  latitude: number
  longitude: number
  postal: string
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export type DistrictType = {
  id: number
  province_id: number
  name: string
  latitude: number
  longitude: number
  postal: string
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export type SubDistrictType = {
  id: number
  district_id: number
  name: string
  latitude: number
  longitude: number
  postal: string
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export type SubDistrictDetailType = {
  id: number
  subdistrict_id: number
  subdistrict_name: string
  district_id: number
  district_name: string
  province_id: number
  province_name: string
}

// Request
export interface LocationRequestType extends PageOptionRequestType {
  name: string
  country_id?: number
  province_id?: number
  district_id?: number
  subdistrict_id?: number
  village_id?: number
}

export interface SubDistrictRequestType extends PageOptionRequestType {
  query: string
}
