import * as yup from 'yup'

export type RoundingData = {
  id: number
  outlet_id: number

  is_rounding_cash_enable: boolean
  cash_rounding_type: 'FLOOR' | 'CEIL' | 'AUTOMATIC'
  cash_amount_divider: number
  cash_amount_breakpoint: number

  is_rounding_non_cash_enable: boolean
  non_cash_amount_divider: number
  non_cash_amount_breakpoint: number
  non_cash_rounding_type: 'FLOOR' | 'CEIL' | 'AUTOMATIC'
}

export interface RoundingType extends RoundingData {
  outlet_id: number
  created_at: Date
  created_by: number | null
  updated_at: Date
  updated_by: number | null
}

export const RoundingSchema = yup.object<RoundingData>().shape({
  outlet_id: yup.number().required().label('Outlet'),

  is_rounding_cash_enable: yup.boolean().required().label('Enable Cash Rounding'),
  cash_rounding_type: yup
    .string()
    .oneOf(['FLOOR', 'CEIL', 'AUTOMATIC'])
    .required()
    .label('Cash Rounding Type'),
  cash_amount_divider: yup.number().required().label('Cash Amount Divider'),
  cash_amount_breakpoint: yup.number().required().label('Cash Amount Breakpoint'),

  is_rounding_non_cash_enable: yup.boolean().required().label('Enable Non-Cash Rounding'),
  non_cash_rounding_type: yup
    .string()
    .oneOf(['FLOOR', 'CEIL', 'AUTOMATIC'])
    .required()
    .label('Non-Cash Rounding Type'),
  non_cash_amount_divider: yup.number().required().label('Non-Cash Amount Divider'),
  non_cash_amount_breakpoint: yup.number().required().label('Non-Cash Amount Breakpoint')
})
