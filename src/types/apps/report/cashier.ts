export type ReportSalePerCashierItemType = {
  id: number
  outlet_id: number
  outlet_name: string
  user_id: number
  user_name: string
  total_cashier_sales: number
  total_orders: number
  total_cash_orders: number
  total_non_cash_orders: number
}

export type ReportSalesCashierSummaryType = {
  total_cashier_sales: number
  total_orders: number
  total_cash_orders: number
  total_non_cash_orders: number
}

export type ReportSalesPerCashierResponseType = ReportSalesCashierSummaryType & {
  cashier_sale_item: ReportSalePerCashierItemType[]
}

export type ReportCashierPerShiftItemType = {
  id: number
  opening_hour: Date
  closing_hour: Date | null
  user_id: number
  user_name: string
  outlet_id: number
  outlet_name: string
  device_id: number
  device_name: string
  initial_balance: number
  final_balance: number
  total_cash_sales: number
  total_non_cash_sales: number
}

export type ReportCashierPerShiftSummaryType = {
  total_non_cash_sales: number
  total_cash_sales: number
}

export type ReportCashierPerShiftResponseType = ReportCashierPerShiftSummaryType & {
  cashier_shift_sale_item: ReportCashierPerShiftItemType[]
}

export interface ReportCashierCashItem {
  id: number
  cash_date: Date
  outlet_name: string
  user_name: string
  device_name: string
  total_cash_in: number
  total_cash_out: number
  final_balance: number
}

export interface ReportCashierCashSummary {
  total_cash_in: number
  total_cash_out: number
  final_balance: number
}

export interface ReportCashierCashResponseType extends ReportCashierCashSummary {
  cashier_cash_items: ReportCashierCashItem[]
}

export interface ReportCashierCashDetailItem {
  id: number
  note: string
  cash_date: Date
  cash_type: string
  outlet_name: string
  user_name: string
  cash_in: number
  cash_out: number
  device_name: string
}

export interface ReportCashierCashDetailResponseType {
  cashier_cash_detail_items: ReportCashierCashDetailItem[]
}

export interface ReportCashierCashDetailSummary {
  total_cash_in: number
  total_cash_out: number
}

export interface ReportCashierCloseSummary {
  shift_date: string
  outlet_id: number
  outlet_name: string
  device_id: number
  device_name: string
  shift_start: string
  shift_end: Date
  user_id: number
  user_name: string
  total_cash_sales: number
  total_non_cash_sales: number
  non_cash_sales_items: {
    payment_method_name: string
    total_payment_method_sales: number
  }[]
  total_sales: number
  total_completed_transaction: number
  total_product_sold: number
  total_tax: number
  total_service_charges: number
  initial_balance: number
  final_balance: number
  actual_cash_balance: number
  balance_difference: number
}

export interface ReportTotalProductCashier {
  shift_date: string
  outlet_id: number
  outlet_name: string
  device_id: number
  device_name: string
  shift_start: string
  shift_end: Date | null
  user_id: number
  user_name: string
  list_products: {
    product_name: string
    total_product_sold: number
    product_unit_name: string
  }[]
  grand_total: number
}
