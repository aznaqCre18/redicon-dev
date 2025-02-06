export type ReportCommisionItemType = {
  id: number
  employee_id: number
  employee_name: string
  outlet_id: number
  outlet_name: string
  order_id: number
  order_total: number
  order_date: Date
  quantity: number
  total: number
}

export type ReportCommissionSummaryType = {
  total_commission_sales: number
  total_order_sales: number
  total_product_sold: number
}

export type ReportCommissionResponseType = ReportCommissionSummaryType & {
  commission_sale_item: ReportCommisionItemType[]
}

export type ReportCommissionDetailItemType = {
  id: number
  order_date: Date
  order_number: string
  commission_type: string
  name: string
  quantity: number
  total: number
}

export type ReportCommissionDetailSummaryType = {
  total_commission_sales: number
  total_product_sold: number
}

export type ReportCommissionDetailResponseType = ReportCommissionDetailSummaryType & {
  commission_detail_sale_item: ReportCommissionDetailItemType[]
}
