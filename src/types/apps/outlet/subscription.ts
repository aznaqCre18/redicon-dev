import { SubscriptionType } from '../subscription'
import { OutletType } from './outlet'

export interface OutletSubscriptionDetailType {
  outlet_subscription: OutletSubscriptionType
  outlet: OutletType
  subscription: SubscriptionType
  owner_bank: null
}

export interface OutletSubscriptionType {
  id: number
  outlet_id: number
  payment_method: null
  owner_bank_id: null
  vendor_id: number
  subscription_id: number
  transaction_id: string
  amount: number
  amount_mdr_provider: number
  amount_mdr_app: number
  total_amount: number
  grand_total: number
  description: string
  is_done: boolean
  status: string
  declined_reason: null
  updated_by_owner_id: null
  term: string
  vat: number
  vat_percentage: number
  duration: number
  expired_at: Date
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}

export interface AddSubscriptionData {
  term: string
  subscription_id: number
  payment_method: string
  owner_bank_id: number
  outlet: OutletData[]
}

export interface OutletData {
  outlet_id: number
  duration: number
}
