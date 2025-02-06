import * as yup from 'yup'

export interface ICostCenter {
  id: number
  name: string
  department_id: number
  description: string
  is_active: boolean
  created_at: string
  created_by: number | null
  updated_at: string
  updated_by: number | null
}

export type CostCenterPatch = {
  id?: number | null | undefined
  request?: any
}

export const CostCenterSchmea = yup.object<ICostCenter>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('Nama Cost Center'),
  department_id: yup.number().required().label('Departement')
})

export type CostCenterType = yup.InferType<typeof CostCenterSchmea>
