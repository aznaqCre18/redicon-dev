import * as yup from 'yup'

export interface OrderAlertData {
  outlet_id: number
  name: string
  description: string
  type: 'BEFORE' | 'AFTER'
  relative_to: 'CHECK IN DATE' | 'CHECK OUT DATE'
  minutes: number
  is_active: boolean
}

export interface OrderAlertType extends OrderAlertData {
  id: number
  outlet_name: string

  created_at: Date
  updated_at: Date
  created_by: number
  created_by_name: string
  updated_by: number
  updated_by_name: string
}

export const OrderAlertSchema = yup.object<OrderAlertData>().shape({
  outlet_id: yup.number().required().label('Outlet'),
  name: yup.string().required().label('Name'),
  description: yup.string().required().label('Description'),
  type: yup.string().required().label('Type'),
  relative_to: yup.string().required().label('Relative To'),
  minutes: yup.number().required().label('Minutes'),
  is_active: yup.boolean().required().label('Is Active')
})
