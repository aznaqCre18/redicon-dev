export interface ProfitLossType {
  total_net_profit: number
  total_gross_profit: number
  total_operation_profit: number
  profit_loss_group_items: ProfitLossGroupItem[]
}

export interface ProfitLossGroupItem {
  group_name: string
  items: Item[]
  total_group_value: number
}

export interface Item {
  date: Date | null
  name: string
  value: number
  operator: 'add' | 'subtract'
}
