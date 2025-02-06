import { VariantType } from '../productType'

export type ReportProductSalesSummaryType = {
  total_product_sold_quantity: number
  total_product_sold_amount: number
}

export type ReportProductSaleItemType = {
  id: number
  sku: string
  name: string
  category_id: number
  category_name: string
  product_sold_quantity: number
  product_sold_amount: number
}

export type ReportSalesResponseType = ReportProductSalesSummaryType & {
  product_sale_item: ReportProductSaleItemType[]
}

export type ReportSalePerCategoryItemType = {
  id: number
  category_id: number
  category_name: string
  total_sales: number
  total_product_sold: number
}

export type ReportSalesCategorySummaryType = {
  total_sales: number
  total_product_sold: number
}

export type ReportSalesPerCategoryResponseType = ReportSalesCategorySummaryType & {
  category_sale_item: ReportSalePerCategoryItemType[]
}

export type ReportSalePerCustomerItemType = {
  id: number
  customer_id: number
  customer_name: string
  total_sales: number
  total_orders: number
  total_product_sold: number
}

export type ReportSalePerUserItemType = {
  id: number
  user_id: number
  user_name: string
  total_user_sales: number
  total_orders: number
  total_product_sold: number
}

export type ReportSalesCustomerSummaryType = {
  total_sales: number
  total_orders: number
  total_product_sold: number
}

export type ReportSalesUserSummaryType = {
  total_user_sales: number
  total_orders: number
  total_product_sold: number
}

export type ReportSalePerPeriodSummary = {
  total_orders: number
  total_product_sold: number
  total_sales: number
  total_grand_sales: number
}

export type ReportSalesPerPeriodItemType = ReportSalePerPeriodSummary & {
  outlet_name: string
  date: string
}

export type ReportSalesPerPeriodResponseType = {
  period_sale_item: ReportSalesPerPeriodItemType[]
}

export type ReportSalesPerCustomerResponseType = ReportSalesCustomerSummaryType & {
  customer_sale_item: ReportSalePerCustomerItemType[]
}

export type ReportSalesPerUserResponseType = ReportSalesUserSummaryType & {
  user_sale_item: ReportSalePerUserItemType[]
}

export type ReportSalePerBrandItemType = {
  id: number
  brand_id: number
  brand_name: string
  total_brand_sales: number
  total_product_sold: number
}

export type ReportSalesBrandSummaryType = {
  total_brand_sales: number
  total_product_sold: number
}

export type ReportSalesPerBrandResponseType = ReportSalesBrandSummaryType & {
  brand_sale_item: ReportSalePerBrandItemType[]
}

export type ReportSalePerOutletItemType = {
  id: number
  outlet_id: number
  outlet_name: string
  total_outlet_sales: number
  total_product_sold: number
}

export type ReportSalesOutletSummaryType = {
  total_outlet_sales: number
  total_product_sold: number
}

export type ReportSalesPerOutletResponseType = ReportSalesOutletSummaryType & {
  outlet_sale_item: ReportSalePerOutletItemType[]
}

export type ReportSalePerTerminalItemType = {
  id: number
  device_id: string
  device_name: string
  outlet_id: number
  total_orders: number
  total_product_sold: number
  total_sales: number
}

export type ReportSalesPerTerminalSummaryType = {
  total_orders: number
  total_product_sold: number
  total_sales: number
}

export type ReportSalesPerTerminalResponseType = ReportSalesPerTerminalSummaryType & {
  terminal_sale_item: ReportSalePerTerminalItemType[]
}

export interface ReportSalesPerVoidItemType {
  id: number
  no_void: number
  created_at: Date
  order_cart_id: number
  deleted_at: Date
  created_by: number
  created_by_name: string
  deleted_by: number
  deleted_by_name: string
  order_type: string
  outlet_id: number
  outlet_name: string
  outlet_table_name: string
  list_product: string
  total_void_value: number
}

export type ReportSalesPerVoidSummaryType = {
  total_void_value: number
  total_void: number
}

export type ReportSalesPerVoidResponseType = ReportSalesPerVoidSummaryType & {
  report_void_items: ReportSalesPerVoidItemType[]
}

export interface ReportSalesPerRefundItemType {
  order_id: number
  refund_number: string
  order_number: string
  refund_date: Date
  order_date: Date
  total_refunds: number
  payment_method: string
  outlet_name: string
}

export type ReportSalesPerRefundSummaryType = {
  total_orders: number
  total_refunds: number
}

export type ReportSalesPerRefundResponseType = ReportSalesPerRefundSummaryType & {
  report_refund_items: ReportSalesPerRefundItemType[]
}

export interface RefundType {
  customer_name: string
  refund_number: string
  order_number: string
  refund_date: Date
  order_date: Date
  order_type: string
  refund_reason: string
  refund_note: string
  created_by_name: string
  authorization_by_name: string
  tax: number
  ppn: number
  service_charges_mdr: number
  total: number
  grand_total: number
  list_items: ListItem[]
}

// export interface DiscountMembership {}

export type ReportReturnSalesItemType = {
  index: number
  id: number
  no_retur: number
  date: string
  customer_id: number
  customer_name: string
  total_amount: number
  total_quantity: number
}

export type ReportReturnSalesPerCustomerItemType = {
  customer_id: number
  customer_name: string
  total_amount: number
  total_quantity: number
}

export type ReportReturnSalesPerCustomerResponseType = {
  total_return_sale_amount: number
  total_return_sale_quantity: number
  return_sale_item: ReportReturnSalesPerCustomerItemType[]
}

export type ReportReturnSalesResponseType = {
  total_return_sale_amount: number
  total_return_sale_quantity: number
  return_sale_item: ReportReturnSalesItemType[]
}

export type ReportSalesPerOrderTypeItemType = {
  id: number
  total_orders: number
  total_sales: number
  order_type: string
}

export type ReportSalesPerOrderSummaryType = {
  total_orders: number
  total_sales: number
}

export type ReportSalesPerOrderTypeResponseType = {
  order_type_sales_item: ReportSalesPerOrderTypeItemType[]
} & ReportSalesPerOrderSummaryType

export interface VoidType {
  created_at: Date
  order_cart_id: number
  deleted_at: Date
  created_by: number
  created_by_name: string
  deleted_by: number
  deleted_by_name: string
  order_type: string
  outlet_id: number
  outlet_name: string
  outlet_table_name: string
  customer_id: number
  customer_name: string
  delete_reason: null
  delete_note: null
  list_items: ListItem[]
}
export interface ListItem {
  id: number
  order_cart_id: number
  product_id: number
  product: Product
  product_variant_id: null
  product_variant: VariantType
  quantity: number
  price: number
  discount: number
  discount_type: null
  name: string
  note: string
  ppn: null
  tax: number
  checked_out_quantity: number
  created_at: Date
  updated_at: Date
}

export interface Product {
  brand_id: number
  category_id: number
  commission_type: string
  commission_value: null
  created_at: Date
  created_by: number
  date_best_seller: null
  detail: string
  dimention: Dimention
  discount: number
  discount_end_date: null
  discount_membership: any
  discount_start_date: null
  discount_type: null
  fix_tax: number
  gf_id: null
  has_video: boolean
  id: number
  is_best_seller: boolean
  is_promo: null
  is_show_on_pos: boolean
  label_id: null
  maximum_order: number
  media: string[] | null
  minimum_order: number
  name: string
  notification: boolean
  position: null
  price: { [key: string]: number }
  product_type: string
  purchase_discount: null
  purchase_discount_type: null
  purchase_price: number
  rack_position: string
  sku: string
  sold_quantity: number
  status: string
  stock: number
  supplier_id: null
  unit_id: number
  updated_at: Date
  updated_by: null
  url_youtube: null
  vendor_id: number
  weight: number
  wholesale_price: any[]
}

export interface Dimention {
  height: number
  length: number
  width: number
}
