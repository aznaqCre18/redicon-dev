import * as yup from 'yup'
import { OutletType } from '../outlet/outlet'
import { ProductType, VariantResponseType } from '../productType'
import { UnitType } from '../unitType'
import { CustomerType } from '../customerType'

export interface ReturnSaleData {
  created_at?: string
  return_sale_number: string | null
  grand_discount: number
  payment_method: string
  outlet_id: number
  customer_id: number
  return_sale_items: ReturnSaleItem[]
}

export interface ReturnSaleDataUpdate extends ReturnSaleData {
  sales_item_deleted: number[]
}

export interface ReturnSaleItem {
  product_id: number
  product_variant_id?: number
  quantity: number
  discount: number
  price: number
  name: string
}

export interface ReturnSaleDetailItem {
  id?: number
  product_id: number
  product_variant_id?: number
  quantity: number
  discount: number
  price: number
  name: string
  product: ProductTypeWithUnit
  product_variant: VariantResponseType
}

export interface ProductTypeWithUnit extends ProductType {
  unit: UnitType
}

export interface ReturnSaleDetailData {
  id: number
  return_sale_number: string | null
  purchase_number: string
  grand_discount: number
  outlet_id: number
  customer_id: number
  grand_total: number
  total: number
  total_discount: number
  return_sale_number_is_generated: boolean
  total_quantity: number
  total_item: number
  payment_status: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface ReturnSaleDetailType extends ReturnSaleDetailData {
  return_sale_items: ReturnSaleDetailItem[]
  outlet: OutletType
  customer: CustomerType
}

export const ReturnSaleSchema = yup.object<ReturnSaleData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  return_sale_number: yup.string().nullable().label('Invoice Number'),
  payment_method: yup.string().required().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  customer_id: yup.number().required().label('Customer'),
  grand_discount: yup.number().required().label('Global Discount'),
  return_sale_items: yup
    .array(
      yup.object<ReturnSaleItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        quantity: yup.number().required(),
        discount: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .min(1)
    .label('Sales Item')
})

export const ReturnSaleUpdateSchema = yup.object<ReturnSaleData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  payment_method: yup.string().required().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  customer_id: yup.number().required().label('Customer'),
  grand_discount: yup.number().required().label('Grand Discount'),
  return_sale_items: yup
    .array(
      yup.object<ReturnSaleItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        quantity: yup.number().required(),
        discount: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .label('Sales Item')
})
