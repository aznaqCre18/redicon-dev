export interface ReportOrderItemType {
  id: number
  order_number: string
  created_at: Date
  order_status: string
  customer_id: number
  outlet_name?: string
  customer_name: string
  qty: number
  sub_total: number
  discount: number
  total_product_fix_tax_per_item: number
  total_product_member_discount: number
  total: number
  global_discount: number
  global_discount_recap: number
  tax: number
  ppn: number
  service_charges_mdr: number
  shipping_cost: number
  shipping_tax: number
  grand_total: number
  outlet_id: number
}

export interface ReportOrderSummaryType {
  total_orders: number
  total_product_sold: number
  total_sales: number
  total_grand_sales: number
}

export interface ReportOrderResponseType {
  report_order_item: ReportOrderItemType[]
}
