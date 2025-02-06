import * as yup from 'yup'

export type CodSettingData = {
  name: string
  price: number
  is_active: boolean
}

export interface CodSettingType extends CodSettingData {
  id: number
  vendor_id: number
  logo: string | null
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const CodSettingSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
  price: yup.number().required().label('Price'),
  is_active: yup.boolean().required().label('Status')
})
