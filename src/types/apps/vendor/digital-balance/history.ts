import { OutletType } from '../../outlet/outlet'

export interface DigitalBalanceHistoryType {
  id: number
  vendor_id: number
  outlet_id: number
  order_id: number
  disbursement_id: null
  order_code: string
  transaction_id: string
  amount: number
  amount_mdr_provider: number
  amount_mdr_app: number
  type_cash_flow: string
  description: string
  total_amount: number
  date_settlement: Date
  is_settlement: boolean
  created_at: Date
  updated_at: Date
}

export interface DigitalBalanceHistoryDetailType {
  index: number
  digital_balance_history: DigitalBalanceHistoryType
  outlet: OutletType
}
