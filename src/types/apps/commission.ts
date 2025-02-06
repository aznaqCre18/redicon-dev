import * as yup from 'yup'
import { CategoryType } from './categoryType'
import { EmployeeType } from './employee'

export type CommissionValueType = 'percentage' | 'nominal'
export type CommissionTypeType = 'product' | 'category' | 'transaction'

export interface CommissionData {
  outlet_id: number
  active_status: boolean
  is_required: boolean
  name: string
  type: CommissionTypeType
  employee_ids: number[]
  option_type: CommissionValueType
  option_value: number

  // type
  category_ids?: number[]
  product_ids?: number[]
  product_variant_ids?: number[]
}

export interface CommissionType
  extends Omit<CommissionData, 'product_ids' | 'product_variant_ids'> {
  product_ids: number[]
  id: number
  outlet_name: string
  product_names: string[]
  user_names: string[]
  vendor_id: number
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number
}

export interface CommissionDetailType {
  commission: CommissionType
  categories?: CategoryType[]
  products?: ProductType[]
  product_variants?: ProductVariantType[]
  employees?: EmployeeType[]
}

export const CommissionSchema = yup.object<CommissionData>().shape({
  outlet_id: yup.number().required().label('Outlet'),
  // active_status: yup.boolean().required(),
  name: yup.string().required().label('Name Comission'),
  type: yup
    .string()
    .oneOf(['product', 'category', 'transaction'])
    .required()
    .label('Type Comission'),
  employee_ids: yup.array().of(yup.number()).required().label('Employee'),
  option_type: yup.string().required().label('Type Comission'),
  option_value: yup.number().required().label('Value Comission'),

  product_ids: yup.array().of(yup.string()).nullable().label('Product'),
  // product_variant_ids: yup.array().of(yup.number()).nullable().label('Variant'),
  category_id: yup.number().nullable().label('Category')
})

// Helper
export const helperExtractProductIds = (data: string[]): number[] => {
  return data.filter(item => !item.includes('-')).map(item => parseInt(item))
}
export const helperExtractProuductVariantIds = (data: string[]): number[] => {
  return data.filter(item => item.includes('-')).map(item => parseInt(item.split('-')[1]))
}

export const responseToProductIds = (data: CommissionDetailType): string[] | undefined => {
  const productIds: string[] = []

  const variants = data.product_variants?.map(item => item.product_id) ?? []

  data.products
    ?.filter(item => !variants.includes(item.id))
    .forEach(item => {
      productIds.push(item.id.toString())
    })

  data.product_variants?.forEach(item => {
    productIds.push(`${item.product_id}-${item.id}`)
  })

  return productIds.length > 0 ? productIds : undefined
}

export interface ProductType {
  id: number
  category_id: number
  category_name: string
  name: string
}

export interface ProductVariantType {
  id: number
  category_id: number
  category_name: string
  product_id: number
  product_name: string
  name: string
}
