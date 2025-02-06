import * as yup from 'yup'

export interface PromotionBasicData {
  outlet_ids: number[]
  name: string
  description: string
  start_date: Date | string
  end_date: Date | string
  discount_type: string
  discount_value: number
}

export interface PromotionBasicType extends Omit<PromotionBasicData, 'outlet_ids'> {
  id: number
  outlet_id: number
  outlet_name: string

  created_at: Date
  updated_at: Date
  created_by: number
  created_by_name: string
  updated_by: number
  updated_by_name: string
}

export const PromotionBasicSchema = yup.object<PromotionBasicData>().shape({
  outlet_ids: yup.array().of(yup.number()).required().label('Outlet'),
  name: yup.string().required().label('Promosi Name'),
  description: yup.string().required().label('Description'),
  start_date: yup.date().required().label('Start Date'),
  end_date: yup.date().required().label('End Date'),
  discount_type: yup.string().required().label('Discount Type'),
  discount_value: yup.number().required().label('Discount Value')
})
