import * as yup from 'yup'
import { StoreGeneralSettingData } from './settings/store'

export type VendorStoreFeatureSettingData = {
  product_new_arrival_duration: number
  product_best_seller_duration: number
  product_best_seller_quantity: number
  product_stock_status_limited: number
  order_expired_in_minute: number
  cart_item_expired_in_minute: number
  reduce_stock_product: 'CHECKOUT' | 'TROLLEY'
  is_maximum_order_product_in_cart: boolean
  is_maximum_order_qty_product_in_cart: boolean
  is_maximum_order_quantity_per_customer_in_cart: boolean
  maximum_order_product_in_cart?: number
  maximum_order_qty_product_in_cart?: number
  maximum_order_quantity_per_customer_in_cart?: number
}

export type VendorTaxSettingData = {
  is_fix_tax_product_checkout_active: boolean
  fix_tax_products: number
  is_shipping_tax_by_weight_checkout_active: boolean
  shipping_tax_by_weight: number
}

export type VendorProductSettingData = {
  is_allow_negative_stock_sales: boolean
  can_delete_product_when_already_ordered: boolean
}

export type VendorOrderSettingData = {
  reset_order_number_type: 'DAY' | 'MONTH' | 'YEAR' | 'NEVER'
  reset_order_number_type_pos: 'DAY' | 'MONTH' | 'YEAR' | 'NEVER'
}

export interface VendorSettingType
  extends VendorStoreFeatureSettingData,
    VendorTaxSettingData,
    VendorOrderSettingData,
    StoreGeneralSettingData,
    VendorProductSettingData {
  id: number
  vendor_id: number
  usage_storage: number
  max_storage: number
  usage_uploaded_video: number
  max_upload_video: number
  max_upload_image_per_product: number
  max_upload_video_per_product: number
  max_size_per_image: number
  max_size_per_video: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const VendorStoreFeatureSettingSchema = yup.object<VendorStoreFeatureSettingData>().shape({
  product_new_arrival_duration: yup.number().required().label('Product New Arrival Duration'),
  product_best_seller_duration: yup.number().required().label('Product Best Seller Duration'),
  reduce_stock_product: yup
    .string()
    .oneOf(['CHECKOUT', 'TROLLEY'])
    .required()
    .label('Reduce Stock Product'),
  is_maximum_order_product_in_cart: yup
    .boolean()
    .required()
    .label('Is Maximum Order Product In Cart'),
  is_maximum_order_qty_product_in_cart: yup
    .boolean()
    .required()
    .label('Is Maximum Order Qty Product In Cart'),
  is_maximum_order_quantity_per_customer_in_cart: yup
    .boolean()
    .required()
    .label('Is Maximum Order Quantity Per Customer In Cart'),
  maximum_order_product_in_cart: yup.number().nullable().label('Maximum Order Product In Cart'),
  maximum_order_qty_product_in_cart: yup
    .number()
    .nullable()
    .label('Maximum Order Qty Product In Cart'),
  maximum_order_quantity_per_customer_in_cart: yup
    .number()
    .nullable()
    .label('Maximum Order Quantity Per Customer In Cart')
})

export const VendorTaxSettingSchema = yup.object<VendorTaxSettingData>().shape({
  fix_tax_products: yup.number().nullable().label('Fix Tax Products'),
  shipping_tax_by_weight: yup.number().required().label('Shipping Tax per Kg'),
  is_shipping_tax_by_weight_checkout_active: yup
    .boolean()
    .required()
    .label('Is Shipping Tax By Weight Checkout Active')
})

export const VendorOrderSettingSchema = yup.object<VendorOrderSettingData>().shape({
  reset_order_number_type: yup
    .string()
    .oneOf(['DAY', 'MONTH', 'YEAR', 'NEVER'])
    .required()
    .label('Reset Order Number Type'),
  reset_order_number_type_pos: yup
    .string()
    .oneOf(['DAY', 'MONTH', 'YEAR', 'NEVER'])
    .required()
    .label('Reset Order Number Type')
})

export const VendorProductSettingSchema = yup.object<VendorProductSettingData>().shape({
  is_allow_negative_stock_sales: yup.boolean().required().label('Is Allow Negative Stock Sales'),
  can_delete_product_when_already_ordered: yup
    .boolean()
    .required()
    .label('Can Delete Product When Already Ordered')
})
