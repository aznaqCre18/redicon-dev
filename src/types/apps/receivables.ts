// ** Third Party Imports
import * as yup from 'yup'

export interface ReceivableData {
  outlet_id: number
  sale_id: number
  customer_id: number
  receivable_date: Date
  amount: number
}

export interface ReceivableType extends ReceivableData {
  id: number
  is_due: boolean
  receivable_due_date: Date
  outlet_name: string
  sale_number: string
  customer_name: string
  payment_status: string
  receivable_number: string
  receivable_term: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number
}

export type ReceivableResponse = ReceivableType[]

export type AddRepaymentReceivableData = {
  receivable_paid_date?: string
  ids: number[]
}

export const AddRepaymentReceivableSchema = yup.object().shape({
  receivable_paid_date: yup.string().nullable().label('Receivable Paid Date'),
  ids: yup.array().of(yup.number()).required().label('Receivable')
})

export interface ReceivableSummaryResponse {
  total_amount_due: number
  total_amount_not_due: number
  total_amount_paid: number
  total_amount_unpaid: number
  total_all_amount: number
}
