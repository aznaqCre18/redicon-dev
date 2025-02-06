import * as yup from 'yup'
import { OutletType } from '../outlet/outlet'

export type DivisionData = {
  name: string
  selling_price: number
  unique_order_number: boolean
}

export type DivisionType = DivisionData & {
  id: number
  vendor_id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export type DivisionDetailType = {
  division: DivisionType
  outlets: OutletType[]
}

export const DivisionSchema = yup.object().shape({
  name: yup.string().required().label('Division Name'),
  selling_price: yup.number().min(1).required().label('Selling Price'),
  unique_order_number: yup.boolean().required().label('Unique Order Number')
})
