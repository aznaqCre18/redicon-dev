import * as yup from 'yup'
import YupPassword from 'yup-password'
import { TokenType } from './authTYpe'
import { UserType } from './userTypes'

YupPassword(yup)

// ** Types

export type VendorData = {
  name: string
  logo: string
  url: string
  website: string
  api_key: string
  address: string
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  business_type_id: string
}

export interface VendorType extends VendorData {
  id: string
  created_at: string
  created_by?: string
  updated_at: string
  updated_by?: string
}

export type RegistrationResponse = {
  vendor: VendorType
  user: UserType
  token: TokenType
}

export type VendorRegistrationData = {
  name: string // The name of the company owner (account) who is using this data for authorization purposes.
  email: string // The email address associated with the company owner's account.
  phone: string // The phone number associated with the company owner's account.
  password: string // The password for the company owner's account used for authorization.
  password_confirmation: string // The password for the company owner's account used for authorization.
  vendor_name: string // The name of the company.
  country_id: number
  province_id: number
  district_id: number
  subdistrict_id: number
  address: string // The address of the company.
  business_type_id: number // A URL or identifier associated with the company.
}

export const registerSchema = yup.object<VendorRegistrationData>().shape({
  name: yup.string().required().label('Name'),
  email: yup.string().email().required().label('Email'),
  phone: yup.string().required().label('Phone'),
  password: yup.string().password().required().label('Password'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required()
    .label('Password Confirmation'),
  vendor_name: yup.string().required().label('Vendor Name'),
  country_id: yup.number().required().label('Country'),
  province_id: yup.number().required().label('Province'),
  district_id: yup.number().required().label('District'),
  subdistrict_id: yup.number().typeError('Select Subdistrict').required().label('Subdistrict'),
  address: yup.string().required().label('Address'),
  business_type_id: yup.number().typeError('Select Business Type').required().label('Business Type')
})

export type ResetPasswordData = {
  email?: string
  phone?: string
  code: string
  new_password: string
  new_password_confirmation: string
}

export const resetPasswordSchema = yup.object().shape({
  email: yup.string().email().nullable().label('Email'),
  phone: yup.string().nullable().label('Phone'),
  code: yup.string().required().label('Code'),
  new_password: yup
    .string()
    .min(6)
    .required()
    .label('New Password')
    // Password must contain at least 1 letter, 1 number and symbol (!@#$%)
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()+`~/?.<,>;:'"\[\]\{\}\\\-\_\=\|])[A-Za-z\d!@#$%^&*()+`~/?.<,>;:'"\[\]\{\}\\\-\_\=\|]{6,}$/,
      'Password must contain at least 1 letter, 1 number and symbol (!@#$%)'
    ),
  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required()
    .label('Password Confirmation')
})
