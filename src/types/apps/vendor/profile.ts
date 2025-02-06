export type VendorProfileModuleType = {
  id: number
  name: string
  description: string
  slug: string
  created_at: Date
  created_by_owner_id: null
  updated_at: Date
  updated_by_owner_id: null
  sort_position: number
}

export interface VendorProfileType {
  vendor: Vendor
  contact: null
  address: Address[]
  digital_balance: DigitalBalance
  is_payment_dana_active: boolean
}

export interface Address {
  id: number
  vendor_id: number
  address: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  postal_code: string
  latitude: number
  longitude: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: null
}

export interface DigitalBalance {
  balance: number
  hold_balance: number
}

export interface Vendor {
  id: number
  name: string
  logo: string
  url: string
  website: string
  'api-key': string
  address: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  business_type_id: number
  wa1: string
  wa2: null
  wa3: null
  description: null
  email: string
  status_migration: boolean
  abbreviation: string
  data_gf_id: null
  gf_payment_database: null
  limit_outlet: number
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}
