export type ReportTaxSummaryType = {
  total_tax: number
  total_service_charges: number
}

export type ReportTaxItemSummaryType = {
  total_orders: number
  total: number
  total_tax: number
  total_service_charges: number
  total_sales: number
}

export type ReportTaxItemType = {
  id: number
  date: Date
  total_orders: number
  total: number
  total_tax: number
  total_service_charges: number
  total_sales: number
  outlet_name: string
}

export type ReportTaxResponseType = {
  report_tax_items: ReportTaxItemType[]
}
