export type ProductDiscountType = {
  id: number
  created_at: string
  period_start: string
  period_end: string
  name: string
  store_id: string
  outlet_id: string
  status: 'Live' | 'Expired' | 'Scheduled'
}
