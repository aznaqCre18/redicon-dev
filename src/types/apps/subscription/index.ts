export interface SubscriptionType {
  id: number
  name: string
  description: null
  maximum_outlet: number
  maximum_device: number
  price_per_month: number
  price_per_year: number
  modules: null
  expired_at: Date
}
