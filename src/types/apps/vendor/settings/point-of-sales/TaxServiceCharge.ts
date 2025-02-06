import * as yup from 'yup'

export type TaxServiceChargeData = {
  id: number
  vendor_id: string

  status: boolean
  tax: number
  type: number // 1: Before Tax, 2: After Tax, 3: Price Include Tax

  service_charge_status: boolean
  service_charge: number
  service_charge_kena_pajak: boolean
}

export interface TaxServiceChargeType extends TaxServiceChargeData {
  outlet_id: number
  created_at: Date
  created_by: number | null
  updated_at: Date
  updated_by: number | null
}

export const TaxServiceChargeSchema = yup.object<TaxServiceChargeData>().shape({
  status: yup.boolean().required().label('Enable Tax'),
  tax: yup.number().min(0).max(100).required().label('Tax Cost'),
  type: yup.number().required().label('Tax Setting'),

  service_charge_status: yup.boolean().required().label('Enable Service Charge'),
  service_charge: yup.number().min(0).max(100).required().label('Service Charge Cost'),
  service_charge_kena_pajak: yup.boolean().required().label('Taxable Service Charges')
})
