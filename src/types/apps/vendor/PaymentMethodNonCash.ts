import * as yup from 'yup'

export type PaymentMethodNonCashData = {
  payment_name: string
  payment_image: string
  account_number: string
  account_name: string
  status: boolean
  mdr_type: 1 | 2 // 1: PERCENTAGE 2: VALUE
  mdr_value: number
  outlet_id: number
  payment_type: 'EDC' | 'EWALLET'
}

export interface PaymentMethodNonCashType extends PaymentMethodNonCashData {
  outlet_name?: string
  vendor_id: number
  id: number
  created_at: Date
  updated_at: Date
}

export const PaymentMethodNonCashSchema = yup.object<PaymentMethodNonCashData>().shape({
  payment_name: yup.string().required().label('Payment Name'),
  payment_image: yup.string().required().label('Payment Image'),
  account_number: yup.string().required().label('Account Number'),
  account_name: yup.string().required().label('Account Name'),
  mdr_type: yup.number().oneOf([1, 2]).required().label('MDR Type'),
  mdr_value: yup.number().required().label('MDR Value'),
  outlet_id: yup.number().required().label('Outlet ID'),
  payment_type: yup.string().oneOf(['EDC', 'EWALLET']).required().label('Payment Type')
})
