import * as yup from 'yup'

export interface IGlAccount {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
  created_by: number | null
  updated_at: string
  updated_by: number | null
}

export interface IGLAccountPatch {
  id?: number | undefined | null
  request?: any
}

export const GlAccountSchema = yup.object<IGlAccount>().shape({
  id: yup.number().nullable(),
  name: yup.string().required().label('GL Account Name')
})

export type GlAccountType = yup.InferType<typeof GlAccountSchema>
