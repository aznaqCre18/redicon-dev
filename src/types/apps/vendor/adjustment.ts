import * as yup from 'yup'
import { OutletType } from '../outlet/outlet'

export type AdjustmentData = {
  name: string
  type: 'percentage' | 'nominal'
  value: number
  is_included_in_invoice: boolean
  is_manual_entry_allowed: boolean
  is_invoice_value_reduced: boolean
  is_show_on_pos: boolean
}

export interface AdjustmentType extends AdjustmentData {
  id: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export type AdjustmentDetailType = {
  adjustment: AdjustmentType
  outlets: OutletType[]
}

export const AdjustmentSchema = yup.object<AdjustmentData>().shape({
  name: yup.string().required().label('Adjustment Name'),
  type: yup.string().required().label('Adjustment Type'),
  value: yup.number().min(1).required().label('Adjustment Value'),
  is_included_in_invoice: yup.boolean().required().label('Include to Total Transaction'),
  is_manual_entry_allowed: yup.boolean().required().label('Able to Change'),
  is_invoice_value_reduced: yup.boolean().required().label('Deduct from Total Amount')
})
