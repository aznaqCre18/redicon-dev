import { OutletType } from '../../outlet/outlet'

export interface DigitalBalanceType {
  id: number
  vendor_id: number
  outlet_id: number
  Balance: number
  HoldBalance: number
  created_at: Date
  updated_at: Date
}

export interface DigitalBalanceDetailType {
  digital_balance: DigitalBalanceType
  outlet: OutletType
}
