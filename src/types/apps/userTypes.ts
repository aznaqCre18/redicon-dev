// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { UserRoleType } from './userRoleTypes'
import { UserDepartmentType } from './userDepartmentsType'

export type UserType = {
  id: string
  role: string
  role_id: number
  email: string
  status: string
  billing: string
  company: string
  country: string
  contact: string
  fullName: string
  username: string
  currentPlan: string
  avatarColor?: ThemeColor
  name: string
  profile_picture: string
  phone: string
  department_id: number
  employee_id?: number
  customer_id?: number
  is_supervisor?: boolean
  outlet_id?: number
  last_login: Date
}

export type UserDetailType = {
  user: UserType
  role: UserRoleType
  department: UserDepartmentType
  outlet: {
    outlet_id: number
    name: string
  }[]
}

export type ProjectListDataType = {
  id: number
  img: string
  hours: string
  totalTask: string
  projectType: string
  projectTitle: string
  progressValue: number
  progressColor: ThemeColor
}
