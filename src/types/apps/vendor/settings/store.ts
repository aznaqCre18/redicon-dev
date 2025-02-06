import { DistrictType, ProvinceType, SubDistrictType } from '../../locationType'
import * as yup from 'yup'

// Address

export interface AddressStoreData {
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  address: string
}

export interface AddressStoreType extends AddressStoreData {
  id: number
  vendor_id: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export interface AddressStoreDetailType {
  online_store: AddressStoreType
  address: {
    province: ProvinceType
    district: DistrictType
    sub_district: SubDistrictType
  }
}

// General

export type StoreGeneralSettingData = {
  is_maintenance: boolean
  maintenance_detail: string
}

export const StoreGeneralSettingSchema = yup.object<StoreGeneralSettingData>().shape({
  is_maintenance: yup.boolean().nullable().label('Is Maintenance'),
  maintenance_detail: yup.string().nullable().label('Maintenance Detail')
})

// CMS

export type StoreSettingCMSData = {
  is_show_category_in_header: boolean
  is_show_navigation_in_header: boolean
  is_show_category_in_body: boolean
  is_show_banners: boolean
  is_show_shorcuts: boolean
  is_show_brands: boolean
  show_sub_category: number
  show_products_by: number
  show_categories_by: number
  is_show_variant_image: boolean
  is_show_related_products: boolean
  show_stock_product: number
  is_show_column_variant_one: boolean
  is_show_column_variant_two: boolean
  is_show_column_stock: boolean
  join_column_color_size_stock: boolean
  is_show_out_of_stock_variant_product: boolean
  is_show_out_of_stock_product: boolean
  is_show_checkout_deadline_time_information: boolean
  is_show_checkout_button: boolean
  is_show_pay_on_spot_button: boolean
  checkout_button_text: string
  pay_on_spot_button_text: string
  view_detail_product_variant: number
}

export interface StoreSettingCMSType extends StoreSettingCMSData {
  id: number
  vendor_id: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const StoreSettingCMSSchema = yup.object<StoreSettingCMSType>().shape({
  is_show_category_in_header: yup.boolean().required().label('Show Category in Header'),
  is_show_navigation_in_header: yup.boolean().required().label('Show Navigation in Header'),
  is_show_category_in_body: yup.boolean().required().label('Show Category in Body'),
  is_show_banners: yup.boolean().required().label('Show Banners'),
  is_show_shorcuts: yup.boolean().required().label('Show Shortcuts'),
  is_show_brands: yup.boolean().required().label('Show Brands'),
  show_sub_category: yup.number().required().label('Show Sub Category'),
  show_products_by: yup.number().required().label('Show Products By'),
  show_categories_by: yup.number().required().label('Show Categories By'),
  is_show_variant_image: yup.boolean().required().label('Show Variant Image'),
  is_show_related_products: yup.boolean().required().label('Show Related Products'),
  show_stock_product: yup.number().required().label('Show Stock Product'),
  is_show_column_variant_one: yup.boolean().required().label('Show Column Variant One'),
  is_show_column_variant_two: yup.boolean().required().label('Show Column Variant Two'),
  is_show_column_stock: yup.boolean().required().label('Show Column Stock'),
  join_column_color_size_stock: yup.boolean().required().label('Join Column Color Size Stock'),
  is_show_out_of_stock_variant_product: yup
    .boolean()
    .required()
    .label('Show Out of Stock Variant Product'),
  is_show_out_of_stock_product: yup.boolean().required().label('Show Out of Stock Product'),
  is_show_checkout_deadline_time_information: yup
    .boolean()
    .required()
    .label('Show Checkout Deadline Time Information'),
  is_show_checkout_button: yup.boolean().required().label('Show Checkout Button'),
  is_show_pay_on_spot_button: yup.boolean().required().label('Show Pay on Spot Button'),
  checkout_button_text: yup.string().required().label('Checkout Button Text'),
  pay_on_spot_button_text: yup.string().required().label('Pay on Spot Button Text'),
  view_detail_product_variant: yup.number().required().label('View Detail Product Variant')
})

// Application
export type StoreSettingApplicationData = {
  android_version: number
  ios_version: number
  update_detail: string
  is_force_update: boolean
}

export interface StoreSettingApplicationType extends StoreSettingApplicationData {
  id: number
  vendor_id: number
  apk: string
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const StoreSettingApplicationSchema = yup.object<StoreSettingApplicationType>().shape({
  android_version: yup
    .number()
    .required()
    .typeError('Android Version must be a number')
    .label('Android Version'),
  ios_version: yup
    .number()
    .required()
    .typeError('IOS Version must be a number')
    .label('IOS Version'),
  update_detail: yup.string().required().label('Update Detail'),
  is_force_update: yup.boolean().required().label('Is Force Update')
})

// Customer
export type StoreCustomerSettingData = {
  is_customer_required_login: boolean
  is_regist_need_confirm: boolean
  phone_activations: string | null
  phone_services: string | null
  details_inactive_status: string | null
}

export interface StoreCustomerSettingType extends StoreCustomerSettingData {
  id: number
  vendor_id: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const StoreCustomerSettingSchema = yup.object().shape({
  is_customer_required_login: yup.boolean().required().label('Is Customer Required Login'),
  is_regist_need_confirm: yup.boolean().required().label('Is Regist Need Confirm'),
  phone_activations: yup.string().nullable().label('Phone Activations'),
  phone_services: yup.string().nullable().label('Phone Services'),
  details_inactive_status: yup.string().nullable().label('Details Inactive Status')
})
