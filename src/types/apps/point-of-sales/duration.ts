import * as yup from 'yup'

export interface DurationData {
  outlet_id: number
  minutes: number
  is_active: boolean
}

export interface DurationType extends DurationData {
  id: number
  outlet_name: string

  created_at: Date
  updated_at: Date
  created_by: number
  created_by_name: string
  updated_by: number
  updated_by_name: string
}

export const DurationSchema = yup.object<DurationData>().shape({
  outlet_id: yup.number().required().label('Outlet'),
  minutes: yup.number().required().label('Minutes'),
  is_active: yup.boolean().required().label('Is Active')
})
