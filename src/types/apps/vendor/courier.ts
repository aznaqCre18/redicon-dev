import * as yup from 'yup'

export type CourierData = {
  name: string
}

export interface CourierType extends CourierData {
  id: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export const CourierSchema = yup.object<CourierData>().shape({
  name: yup.string().required().label('Courier Name')
})
