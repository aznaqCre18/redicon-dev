import * as yup from 'yup'

export type BrandType = {
  id: number | null
  vendor_id: string
  image: string
  name: string
  code: string
  is_active: boolean
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export const BrandSchema = yup.object<BrandType>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('Brand Name'),
  code: yup.string().required().label('Code')
})
