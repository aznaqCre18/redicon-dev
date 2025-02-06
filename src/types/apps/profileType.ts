import { UserDataType } from 'src/context/types'
import * as yup from 'yup'
import { UserRoleType } from './userRoleTypes'
import { UserDepartmentType } from './userDepartmentsType'

export type ProfileDataType = {
  user: UserDataType
  role: UserRoleType
  department: UserDepartmentType
}

export type ProfilPermissionType = {
  id: number
  name: string
  description: string
  modules: Array<{
    id: number
    name: string
    description: string
    parent_id: number
    permissions: Array<{
      id: number
      module_id: number
      name: string
      value: boolean
    }>
  }>
}

export type ProfilPermissionV2Type = {
  module: string
  permission: string[]
}

export type ProfileType = {
  name: string // The updated name of the user profile ("John Doe").
  username: string // The updated username associated with the user ("johndoe").
  email: string // The updated email address associated with the user ("johndoe@example.com").
  phone: string // The updated phone number associated with the user ("1234567890").
  // role_id: number // The updated role ID associated with the user (1 = Super Admin).
  // department_id: number // The updated department ID associated with the user (1 = Owner).
  //   language_id: 1 // The updated language ID associated with the user (1 = Indonesia).
}

export type ChangePasswordType = {
  old_password: string
  password: string
  password_confirmation: string
}

export type ChangePinType = {
  old_pin: string
  pin: string
}

export const ProfileSchema = yup
  .object<ProfileType>()
  .shape({
    name: yup.string().required().label('Name'),
    username: yup.string().required().label('Username'),
    email: yup.string().email().required().label('Email'),
    phone: yup.string().required().label('Phone')
    // role_id: yup.number().required().label('Role'),
    // department_id: yup.number().required().label('Department')
  })
  .required()

export const ChangePasswordSchema = yup.object<ChangePasswordType>().shape({
  old_password: yup.string().min(6).required().label('Old Password'),
  password: yup.string().min(6).required().label('New Password'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password'), ''], 'Confirm New Passwords must match')
    .label('Confirm New Password')
})

export const ChangePinSchema = yup.object<ChangePinType>().shape({
  old_pin: yup.string().min(6).max(6).required().label('Old PIN'),
  pin: yup.string().min(6).max(6).required().label('New PIN')
})
