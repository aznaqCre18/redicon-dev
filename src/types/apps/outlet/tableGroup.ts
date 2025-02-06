import * as yup from 'yup'
import { OutletType } from './outlet'

export type TableGroupData = {
  name: string
  outlet_id: number
}

export interface TableGroupType extends TableGroupData {
  id: number
  vendor_id: string
  is_default: boolean
  created_at: Date
  updated_at: Date
  created_by: number
  updated_by: number | null
  is_new: boolean
  is_updated: boolean
}

export interface TableGroupDetailType {
  table_group: TableGroupType
  outlet: OutletType
}

export const TableGroupSchema = yup.object<TableGroupData>().shape({
  name: yup.string().required().label('Table Group Name'),
  outlet_id: yup.number().required().label('Outlet')
})
