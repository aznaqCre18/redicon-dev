import * as yup from 'yup'
import { ProductType } from '../productType'
import { UnitType } from '../unitType'
import { CustomerType } from '../customerType'
import { OrderDetailType, OrderItemDetailType } from '../order'

export interface RecapData {
  created_at?: string
  invoice_number: string | null
  global_discount: number
  payment_method: string
  customer_id: number
  recap_invoice_order_detail: RecapItem[]
}

export type RecapDataUpdate = RecapData

export interface RecapItem {
  order_id: number
  order_detail: {
    order_item_id: number
    discount: number
  }[]
}

export interface RecapDetailItem {
  order_id: number
  order: OrderDetailType
  order_detail: OrderItemDetailType[]
}

export interface ProductTypeWithUnit extends ProductType {
  unit: UnitType
}

export interface RecapDetailData {
  id: number
  invoice_number: string | null
  purchase_number: string
  global_discount: number
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

export interface RecapDetailType extends RecapDetailData {
  id: number
  recap_invoice_order_detail: RecapDetailItem[]
  customer: CustomerType
}

export const RecapSchema = yup.object<RecapData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  invoice_number: yup.string().nullable().label('Invoice Number'),
  payment_method: yup.string().required().label('Payment Method'),
  customer_id: yup.number().required().label('Customer'),
  global_discount: yup.number().required().label('Global Discount'),
  recap_invoice_order_detail: yup
    .array(
      yup.object<RecapItem>().shape({
        order_id: yup.number().required(),
        order_detail: yup.array(
          yup.object({
            order_item_id: yup.number().required(),
            discount: yup.number().required()
          })
        )
      })
    )
    .min(1)
    .label('Order Item')
})

export const RecapUpdateSchema = yup.object<RecapData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  payment_method: yup.string().required().label('Payment Method'),
  customer_id: yup.number().required().label('Customer'),
  global_discount: yup.number().required().label('Global Discount'),
  recap_invoice_order_detail: yup
    .array(
      yup.object<RecapItem>().shape({
        order_id: yup.number().required(),
        order_detail: yup.array(
          yup.object({
            order_item_id: yup.number().required(),
            discount: yup.number().required()
          })
        )
      })
    )
    .min(1)
    .label('Order Item')
})
