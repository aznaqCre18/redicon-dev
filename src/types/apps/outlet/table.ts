import * as yup from 'yup'
import { OutletType } from './outlet'
import { TableGroupType } from './tableGroup'

export type OneCreateTableData = {
  group_id: number | undefined
  outlet_id: number | undefined
  name: string
}

export type SimpleCreateTableData = {
  group_id: number | undefined
  outlet_id: number | undefined
  name: string[]
}

export type CreateTableData = {
  group_id: number
  outlet_id: number
  outlet_table: {
    name: string
  }[]
}

export const convertCreateTableData = (data: SimpleCreateTableData): CreateTableData => {
  return {
    group_id: data.group_id ?? 0,
    outlet_id: data.outlet_id ?? 0,
    outlet_table: data.name.map(name => ({ name }))
  }
}

export type TableData = {
  group_id: number
  outlet_id: number
  name: string
}

export interface TableType extends TableData {
  id: number
  vendor_id: string
  table_code: string
  table_status: 'Available' | 'Filled'
  created_at: Date
  updated_at: Date
  created_by: number
  updated_by: number | null
}

export interface TableDetailType {
  table: TableType
  group: TableGroupType
  outlet: OutletType
}

export const createTableDetail = (
  table: TableType[] | undefined,
  group: TableGroupType[] | undefined,
  outlet: OutletType[] | undefined
): TableDetailType[] => {
  if (!table) return []

  const tableGroup = group || []
  const tableOutlet = outlet || []

  return table.map(t => {
    const g = tableGroup.find(g => g.id === t.group_id)
    const o = tableOutlet.find(o => o.id === t.outlet_id)

    return {
      table: t,
      group: g!,
      outlet: o!
    }
  })
}

export const TableSchema = yup.object<OneCreateTableData>().shape({
  outlet_id: yup.number().required().label('Outlet'),
  group_id: yup.number().required().label('Table Group'),
  name: yup.string().required().label('Table Name')
})
