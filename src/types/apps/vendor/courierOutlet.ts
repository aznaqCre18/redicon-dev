import * as yup from 'yup'
import { DistrictType, ProvinceType, SubDistrictType } from '../locationType'

export type CourierOutletData = {
  weight_from: number
  weight_to: number
  estimation: 12
  status: 'Active' | 'Inactive' // "Active" or "Inactive"
  price: number
}

export interface CourierOutletType extends CourierOutletData {
  id: number
  vendor_id: number
  outlet_name: string
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export interface CourierOutletDetailType {
  vendor_courier_detail: CourierOutletType
  address: {
    province: ProvinceType
    district: DistrictType
    subdistrict: SubDistrictType
  }
}

export const CourierOutletSchema = yup.object<CourierOutletData>().shape({
  weight_from: yup.number().required().label('Weight From'),
  weight_to: yup.number().required().label('Weight To'),
  estimation: yup.number().required().label('Estimation'),
  status: yup.string().oneOf(['Active', 'Inactive']).required(),
  price: yup.number().required().label('Charge Courier')
})
