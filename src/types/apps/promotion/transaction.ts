import * as yup from 'yup'

export interface ListItemData {
  minimum_value: number
  maximum_value: number
  discount_type: 'percentage' | 'nominal'
  discount_value: number
}

export interface PromotionTransactionData {
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
  criteria: 'MINIMUM PURCHASE'
  based_on: 'QUANTITY'
  minimum_purchase_quantity: number
  discount_type: string
  discount_value: number
  maximum_discount_value: number
  list_items: ListItemData[]
}

export interface PromotionTransactionType
  extends Omit<PromotionTransactionData, 'outlet_ids' | 'customer_membership_ids' | 'list_items'> {
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
  minimum_value: number
  maximum_value: number
  discount_type: 'percentage' | 'nominal'
  discount_value: number
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

export const PromotionTransactionSchema = yup.object<PromotionTransactionData>().shape({
  outlet_ids: yup.array().of(yup.number()).required().label('Outlet').min(1),
  customer_membership_ids: yup
    .array()
    .of(yup.number())
    .required()
    .label('Customer Membership')
    .min(1),
  name: yup.string().required().label('Promosi Name'),
  description: yup.string().required().label('Description'),
  start_date: yup.date().required().label('Start Date'),
  end_date: yup.date().required().label('End Date'),
  is_available_on_monday: yup.boolean(),
  is_available_on_tuesday: yup.boolean(),
  is_available_on_wednesday: yup.boolean(),
  is_available_on_thursday: yup.boolean(),
  is_available_on_friday: yup.boolean(),
  is_available_on_saturday: yup.boolean(),
  is_available_on_sunday: yup.boolean(),
  is_available_on_pos: yup.boolean(),
  is_available_on_ecommerce: yup.boolean(),
  activation_type: yup.string().required().label('Activation Type').oneOf(['AUTOMATIC', 'MANUAL']),
  criteria: yup.string().required().label('Criteria').oneOf(['MINIMUM PURCHASE']),
  based_on: yup.string().required().label('Based On').oneOf(['PRICE', 'QUANTITY']),
  minimum_purchase_quantity: yup.number().required().label('Minimum Purchase Quantity'),
  discount_type: yup.string().required().label('Discount Type'),
  discount_value: yup.number().required().label('Discount Value'),
  maximum_discount_value: yup.number().required().label('Maximum Discount Value'),
  list_items: yup
    .array()
    .of(
      yup.object<ListItemData>().shape({
        minimum_value: yup.number(),
        maximum_value: yup.number(),
        discount_type: yup.string(),
        discount_value: yup.number()
      })
    )
    .required()
    .label('Transaction Criteria')
    .min(1)
})
