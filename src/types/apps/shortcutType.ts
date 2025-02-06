import * as yup from 'yup'

export type ShortcutData = {
  name: string
  slug: string
  description: string
  url: string
  status: boolean
}

export interface ShortcutType extends ShortcutData {
  id: number | null
  image: string
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export const ShortcutSchema = yup.object<ShortcutData>().shape({
  name: yup.string().required().label('Banner Name'),
  slug: yup.string().required().label('Slug'),
  description: yup.string().nullable().label('Description'),
  url: yup.string().required().label('URL'),
  status: yup.boolean().required().label('Status'),
  image: yup.string().required().label('Image')
})
