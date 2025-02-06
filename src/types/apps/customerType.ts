import * as yup from 'yup'
import { MembershipType } from './membershipType'
import { CustomerAddressDetailType } from './customerAddressType'

export type CustomerData = {
  code: string
  name: string
  username: string
  email: string
  phone: string
  maximum_order_qty_product_in_cart: number | undefined
  maximum_order_quantity_per_customer_in_cart: number | undefined
  credit_term: number | undefined
  password?: string | null
  password_confirmation?: string | null
  language_id: number
  membership_id: number
  employee_id?: number
}

export interface CustomerType extends CustomerData {
  id: string
  membership_level: number
  vendor_id: string
  points: string
  profile_picture: string
  status: 'Active' | 'Inactive'
  gf_payment_balance: number
  employee_name: string | null
  last_login: string
  created_at: string
  updated_at: string
}

export interface CustomerDetailType {
  customer: CustomerType
  membership: MembershipType
  address: CustomerAddressDetailType[]
}

export const CustomerWalkinSchema = yup
  .object<
    CustomerData & {
      subdistrict_id: number
      postal_code: string
      address: string
    }
  >()
  .shape({
    name: yup.string().required().label('Customer Name'),
    membership_id: yup.number().required().label('Membership'),
    maximum_order_qty_product_in_cart: yup.number().nullable().label('Maximum Order'),
    maximum_order_quantity_per_customer_in_cart: yup
      .number()
      .nullable()
      .label('Maximum Order Quantity'),
    employee_id: yup.number().nullable().label('Employee')
  })

export const CustomerSchema = yup
  .object<
    CustomerData & {
      subdistrict_id: number
      postal_code: string
      address: string
    }
  >()
  .shape({
    name: yup.string().required().label('Requestor Name'),
    code: yup.string().nullable().label('Code'),
    username: yup.string().nullable().label('Username'),
    email: yup.string().email().label('Email'),
    phone: yup
      .string()
      // first character is 08 or +62
      .matches(/^(08|\+62)/, 'Phone number must start with 08 or +62')
      // .min(10)
      // .max(13)
      .test('len', 'Phone must be at 10 to 13 characters', val => {
        // delete 0 or +62
        const phone = val?.replace(/^(0|\+62)/, '')
        if (phone) {
          return phone.length >= 9 && phone.length <= 12
        }

        return true
      })
      .required()
      .label('Phone'),
    password: yup.string().nullable().label('Password'),
    password_confirmation: yup
      .string()
      .nullable()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .label('Password Confirmation'),
    language_id: yup.number().required().label('Language'),
    membership_id: yup.number().required().label('Membership'),
    address: yup.string().nullable().label('Address'),
    maximum_order_qty_product_in_cart: yup.number().nullable().label('Maximum Order'),
    maximum_order_quantity_per_customer_in_cart: yup
      .number()
      .nullable()
      .label('Maximum Order Quantity'),
    credit_term: yup.number().nullable().label('Credit Term'),
    subdistrict_id: yup.number().nullable().label('Sub District'),
    postal_code: yup.string().nullable().label('Postal Code'),
    employee_id: yup.number().nullable().label('Employee')
  })

export interface CustomerGFPaymentType {
  id: number
  pelang_id: number
  lun_tip_id: number
  catatan: string
  debet: number
  debet_ex: number
  kredit: number
  kredit_ex: number
  validasi: number
  balance: number
  als_batal: string
  kode_cabang: number
  input_oleh: number
  input_oleh_nama: string
  input_datetime: Date | string
  input_ip: string
  input_computer: string
  input_user: string
  ubah_oleh: number
  ubah_datetime: Date | string
  hapus_oleh: number
  hapus_datetime: Date | string
}

export type CustomerGFPaymentDetailType = {
  customer?: CustomerType
} & CustomerGFPaymentType
