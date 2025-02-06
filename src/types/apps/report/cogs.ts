export interface ReportCOGS {
  id: string
  order_id: string
  order_from: string
  customer_name: string
  total: number
  global_discount: number
  sub_total: number
  cogs: number
  profit_loss: number
  percentage: number
  created_at: Date
}
