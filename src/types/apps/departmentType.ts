import * as yup from 'yup'

export interface IDepartment {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
  created_by: number | null
  updated_at: string
  updated_by: number | null
}

export const DepartmentSchema = yup.object<IDepartment>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('Department name')
})

export type DepartmentType = yup.InferType<typeof DepartmentSchema>
