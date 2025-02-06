import * as yup from 'yup'
import { OutletType } from '../outlet/outlet'
import { ProductType, VariantResponseType } from '../productType'
import { UnitType } from '../unitType'
import { CustomerType } from '../customerType'

export interface SaleData {
  created_at?: string
  order_id: string | null
  global_discount: number
  payment_method: string
  outlet_id: number
  customer_id: number
  sales_details: SaleItem[]
}

export interface SaleDataUpdate extends SaleData {
  sales_item_deleted: number[]
}

export interface SaleItem {
  product_id: number
  product_variant_id?: number
  qty: number
  discount_per_item: number
  price: number
  name: string
}

export interface SaleDetailItem {
  id?: number
  product_id: number
  product_variant_id?: number
  qty: number
  discount_per_item: number
  price: number
  name: string
  product: ProductTypeWithUnit
  product_variant: VariantResponseType
}

export interface ProductTypeWithUnit extends ProductType {
  unit: UnitType
}

export interface SaleDetailData {
  id: number
  order_id: string | null
  purchase_number: string
  global_discount: number
  outlet_id: number
  customer_id: number
  grand_total: number
  total: number
  total_discount: number
  sales_number_is_generated: boolean
  total_qty: number
  total_item: number
  payment_status: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface SaleDetailType {
  sales: SaleDetailData
  sales_details: SaleDetailItem[]
  outlet: OutletType
  customer: CustomerType
}

export const SaleSchema = yup.object<SaleData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  order_id: yup.string().nullable().label('Invoice Number'),
  payment_method: yup.string().required().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  customer_id: yup.number().required().label('Customer'),
  global_discount: yup.number().required().label('Global Discount'),
  sales_details: yup
    .array(
      yup.object<SaleItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        qty: yup.number().required(),
        discount_per_item: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .min(1)
    .label('Sales Item')
})

export const SaleUpdateSchema = yup.object<SaleData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  payment_method: yup.string().required().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  customer_id: yup.number().required().label('Customer'),
  global_discount: yup.number().required().label('Grand Discount'),
  sales_details: yup
    .array(
      yup.object<SaleItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        qty: yup.number().required(),
        discount_per_item: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .label('Sales Item')
})
