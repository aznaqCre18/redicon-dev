import * as yup from 'yup'

export type AttributeType = {
  id: number | null
  name: string
  value: string
  created_at: Date
  updated_at: Date
}

export const AttributeSchema = yup.object<AttributeType>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('Name'),
  value: yup.string().required().label('Value')
})
