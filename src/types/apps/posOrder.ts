import { CustomerType } from './customerType'
import { TableType } from './outlet/table'
import { ProductType, VariantType } from './productType'
import { UnitType } from './unitType'

export interface OrderCartDetailType {
  order_cart: OrderCart
  table: TableType
  customer: CustomerType
  order_cart_items: OrderCartItemElement[]
}

export interface OrderCart {
  id: number
  code: string
  order_type: string
  vendor_id: number
  outlet_id: number
  customer_id: number
  table_id: null
  guest: number
  product_quantity: number
  item_quantity: number
  sub_total: number
  discount: number
  global_discount: number
  tax: number
  ppn: number
  service_charge: number
  grand_total: number
  note: string
  created_at: Date
  created_by: number
  created_by_name: string
  updated_at: Date
  updated_by: null
}

export interface OrderCartItemElement {
  order_cart_item: OrderCartItemOrderCartItem
  product: ProductType
  unit?: UnitType
  product_variant?: VariantType
}

export interface OrderCartItemOrderCartItem {
  id: number
  order_cart_id: number
  product_id: number
  product_variant_id: null
  quantity: number
  price: number
  discount: number
  discount_type: string
  name: string
  note: string
  ppn: number
  tax: number
  created_at: Date
  updated_at: Date
}
