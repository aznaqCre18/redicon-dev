import * as yup from 'yup'

export interface RevenueExpenseGroupData {
  name: string
  type: 'revenue' | 'expense'
}

export interface RevenueExpenseGroupType extends RevenueExpenseGroupData {
  id: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number
}

export const RevenueExpenseGroupSchema = yup.object<RevenueExpenseGroupData>().shape({
  name: yup.string().required().label('Name'),
  type: yup.string().oneOf(['revenue', 'expense']).required().label('Type')
})
