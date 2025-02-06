import * as yup from 'yup'

export interface RevenueExpenseData {
  group_id: number
  amount: number
  note: string
  type: 'revenue' | 'expense'
  date: Date
}

export interface RevenueExpenseType extends RevenueExpenseData {
  id: number
  group_name: string
  file: string
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number
}

export interface RevenueExpenseSummaryType {
  summary: number
  total_revenue: number
  total_expense: number
}

export interface RevenueExpenseDetailType {
  summary: RevenueExpenseSummaryType
  revenue_and_expense: RevenueExpenseType[]
}

export const RevenueExpenseSchema = yup.object<RevenueExpenseData>().shape({
  group_id: yup.number().required().label('Group'),
  amount: yup.number().required().label('Amount'),
  note: yup.string().required().label('Note'),
  type: yup.string().oneOf(['revenue', 'expense']).required().label('Type'),
  date: yup.date().required().label('Date')
})
