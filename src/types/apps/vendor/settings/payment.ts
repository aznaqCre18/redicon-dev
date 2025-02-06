import * as yup from 'yup'

export interface MootaSettingType extends MootaSettingData {
  id: number
  vendor_id: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export const MootaSettingSchema = yup.object().shape({
  bank_name: yup.string().required().label('Bank Name'),
  account_number: yup.string().required().label('Account Number'),
  account_name: yup.string().required().label('Account Name'),
  moota_bank_id: yup.string().required().label('Moota Bank ID'),
  moota_secret_key: yup.string().required().label('Moota Secret Key'),
  status: yup.boolean().required().label('Status')
})

export type MootaSettingData = {
  bank_name: string
  bank_image: string
  account_number: string
  account_name: string
  moota_bank_id: string
  moota_secret_key: string
  status: boolean
}
