import * as yup from 'yup'

export type BankVendorData = {
  outlet_id: number
  bank_name: string
  bank_image: string
  account_number: string
  account_name: string
  is_active: 'Active' | 'Inactive'
}

export interface BankVendorType extends BankVendorData {
  vendor_id: number
  id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export const BankVendorSchema = yup.object<BankVendorData>().shape({
  bank_name: yup.string().required().label('Bank Name'),
  bank_image: yup.string().required().label('Bank Image'),
  account_number: yup.string().required().label('Account Number'),
  account_name: yup.string().required().label('Account Name'),
  outlet_id: yup.number().required().label('Outlet'),
  is_active: yup.string().required().label('Status')
})
