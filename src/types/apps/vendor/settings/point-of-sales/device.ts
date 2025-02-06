import { OutletType } from 'src/types/apps/outlet/outlet'
import * as yup from 'yup'

export type DeviceData = {
  outlet_id: number
  device_name: string
}

export interface DeviceType extends DeviceData {
  id: number
  vendor_id: string
  device_information: string
  code: string
  status: boolean
  last_sync: Date
  last_login: Date
  created_at: Date
  updated_at: Date
}

export type DeviceDetailType = {
  outlet: OutletType
  device_access: DeviceType
}

export const DeviceSchema = yup.object<DeviceData>().shape({
  outlet_id: yup.number().required().label('Outlet'),
  device_name: yup.string().required().label('Device Name')
})
