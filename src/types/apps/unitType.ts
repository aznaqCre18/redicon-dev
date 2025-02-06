import * as yup from 'yup'

export type UnitType = {
  id: number | null
  vendor_id: number
  name: string
  quantity: number
  is_active: boolean
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export const UnitSchema = yup.object<UnitType>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('Unit Name'),
  quantity: yup.number().required().label('Quantity')
})
