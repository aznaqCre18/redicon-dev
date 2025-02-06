import * as yup from 'yup'

export type ExpeditionData = {
  name: string
  status: boolean
}

export interface ExpeditionType extends ExpeditionData {
  id: number
  vendor_id: number
  image: string
  code: string
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export const ExpeditionSchema = yup.object<ExpeditionData>().shape({
  name: yup.string().required().label('Expedition Name')
})
