import { CustomerType } from '../customerType'
import { OrderDetailType } from '../order'
import { ProductType, VariantType } from '../productType'
import { PurchaseDetailType } from '../purchase/purchase'
import { ReturnPurchaseDetailType } from '../purchase/returnPurchase'
import { ReturnSaleDetailData } from '../sale/returnSale'
import { SaleDetailData } from '../sale/sale'
import { UserType } from '../userTypes'

export type ProductHistory = {
  id: number
  vendor_id: number
  customer_id: number
  user_id: number
  order_id: number
  product_id: number
  product_variant_id: number
  stock_before: number
  stock_in: number
  stock_out: number
  final_stock: number
  type: string
  description: string
  is_variant: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export type ProductHistoryDetail = {
  product_history: ProductHistory
  user: UserType
  customer: CustomerType
  order: OrderDetailType
  purchase: PurchaseDetailType
  return_purchase: ReturnPurchaseDetailType
  return_sales: ReturnSaleDetailData
  sales: SaleDetailData
  product: ProductType
  product_variant: VariantType
}
