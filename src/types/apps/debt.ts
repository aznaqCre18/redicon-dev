// ** Third Party Imports
import * as yup from 'yup'

export interface DebtData {
  outlet_id: number
  purchase_id: number
  supplier_id: number
  debt_date: Date
  amount: number
}

export interface DebtType extends DebtData {
  id: number
  is_due: boolean
  debt_due_date: Date
  outlet_name: string
  purchase_number: string
  supplier_name: string
  payment_status: string
  debt_number: string
  debt_term: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number
}

export type DebtResponse = DebtType[]

export type AddRepaymentDebtData = {
  debt_paid_date?: string
  ids: number[]
}

export const AddRepaymentDebtSchema = yup.object().shape({
  debt_paid_date: yup.string().nullable().label('Debt Paid Date'),
  ids: yup.array().of(yup.number()).required().label('Debt')
})

export interface DebtSummaryResponse {
  total_amount_due: number
  total_amount_not_due: number
  total_amount_paid: number
  total_amount_unpaid: number
  total_all_amount: number
}
