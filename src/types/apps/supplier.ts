import * as yup from 'yup'

export interface SupplierData {
  name: string
  address: string
  phone_number: string
  status: 'ACTIVE' | 'INACTIVE'
  credit_term: number
}

export interface SupplierType extends SupplierData {
  id: number
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export const SupplierSchema = yup.object<SupplierData>().shape({
  name: yup.string().required().label('Supplier Name'),
  address: yup.string().required().label('Address'),
  phone_number: yup.string().required().label('Phone'),
  credit_term: yup.number().required().label('Credit Term'),
  status: yup.string().oneOf(['ACTIVE', 'INACTIVE']).nullable().label('Status')
})
