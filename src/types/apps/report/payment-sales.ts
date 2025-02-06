export type ReportPaymentTypeSalesItemType = {
  id: number
  payment_type: string
  payment_method: string
  total_orders: number
  total_sales: number
}

export type ReportPaymentTypeSalesSummaryType = {
  total_orders: number
  total_sales: number
}

export type ReportPaymentTypeSalesResponseType = ReportPaymentTypeSalesSummaryType & {
  payment_type_sales_item: ReportPaymentTypeSalesItemType[]
}
