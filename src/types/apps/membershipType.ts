import * as yup from 'yup'

export type MembershipData = {
  name: string
}

export interface MembershipType extends MembershipData {
  id: number
  level: number
  is_active: boolean
  is_default: boolean
}

export const MembershipSchema = yup.object().shape({
  name: yup.string().required().label('Membership Name')
})
