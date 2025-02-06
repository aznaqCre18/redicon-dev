import * as yup from 'yup'
import { ProductVariantAttribute } from '../order'

export interface ListItemData {
  product_id: number
  product_variant_id: number | null
}

export interface PromotionProductData {
  outlet_ids: number[]
  customer_membership_ids: number[]
  name: string
  description: string
  start_date: Date | string
  end_date: Date | string
  is_available_on_monday: boolean
  is_available_on_tuesday: boolean
  is_available_on_wednesday: boolean
  is_available_on_thursday: boolean
  is_available_on_friday: boolean
  is_available_on_saturday: boolean
  is_available_on_sunday: boolean
  is_available_on_pos: boolean
  is_available_on_ecommerce: boolean
  activation_type: 'AUTOMATIC' | 'MANUAL'
  criteria: 'PER PRODUCT'
  based_on: 'PRICE' | 'QUANTITY'
  minimum_purchase_price: number
  minimum_purchase_quantity: number
  discount_type: string
  discount_value: number
  maximum_discount_value: number
  list_items: ListItemData[]
}

export interface PromotionProductType
  extends Omit<
    PromotionProductData,
    'outlet_ids' | 'customer_membership_ids' | 'list_items' | 'criteria'
  > {
  id: number
  outlet_id: number
  outlet_name: string
  memberships: Membership[]
  list_items: ListItem[]

  created_at: Date
  updated_at: Date
  created_by: number
  created_by_name: string
  updated_by: number
  updated_by_name: string
}

export interface ListItem {
  id: number
  promo_id: number
  product_id: number
  product_name: string
  product_variant_id: null
  product_variant_attributes: ProductVariantAttribute[] | null
  created_at: Date
  updated_at: Date
  created_by: number
  updated_by: number
}

export interface Membership {
  id: number
  vendor_id: number
  level: number
  name: string
  points: number
  is_active: boolean
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: number
}

export const PromotionProductSchema = yup.object<PromotionProductData>().shape({
  outlet_ids: yup.array().of(yup.number()).required().label('Outlet').min(1),
  customer_membership_ids: yup.array().of(yup.number()).label('Customer Membership').min(1),
  name: yup.string().required().label('Promosi Name'),
  description: yup.string().required().label('Description'),
  start_date: yup.date().required().label('Start Date'),
  end_date: yup.date().required().label('End Date'),
  is_available_on_monday: yup.boolean().required().label('Available on Monday'),
  is_available_on_tuesday: yup.boolean().required().label('Available on Tuesday'),
  is_available_on_wednesday: yup.boolean().required().label('Available on Wednesday'),
  is_available_on_thursday: yup.boolean().required().label('Available on Thursday'),
  is_available_on_friday: yup.boolean().required().label('Available on Friday'),
  is_available_on_saturday: yup.boolean().required().label('Available on Saturday'),
  is_available_on_sunday: yup.boolean().required().label('Available on Sunday'),
  is_available_on_pos: yup.boolean().required().label('Available on POS'),
  is_available_on_ecommerce: yup.boolean().required().label('Available on Ecommerce'),
  activation_type: yup.string().required().label('Activation Type').oneOf(['AUTOMATIC', 'MANUAL']),
  criteria: yup.string().required().label('Criteria').oneOf(['PER PRODUCT']),
  based_on: yup.string().required().label('Based On').oneOf(['PRICE', 'QUANTITY']),
  minimum_purchase_price: yup.number().required().label('Minimum Purchase Price'),
  minimum_purchase_quantity: yup.number().required().label('Minimum Purchase Quantity'),
  discount_type: yup.string().required().label('Discount Type'),
  discount_value: yup.number().required().label('Discount Value'),
  maximum_discount_value: yup.number().required().label('Maximum Discount Value'),
  list_items: yup
    .array(
      yup.object<ListItemData>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable()
      })
    )
    .label('Product')
    .min(1)
})
