import * as yup from 'yup'

export interface EmployeeData {
  outlet_id: number
  name: string
  employee_role_id: number
  active_status: boolean
  customer_id?: number
  comission_value: number
  comission_type: 'percentage' | 'nominal'
}

export interface EmployeeType extends EmployeeData {
  id: number
  vendor_id: number
  employee_role_name: string
  customer_name: string
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export interface EmployeeRoleType {
  id: number
  vendor_id: number
  name: string
  active_status: boolean
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export const EmployeeSchema = yup.object<EmployeeData>().shape({
  name: yup.string().required().label('Supplier Name'),
  outlet_id: yup.number().required().label('Outlet'),
  employee_role_id: yup.number().required().label('Employee Role'),
  active_status: yup.boolean().required().label('Status'),
  customer_id: yup.number().label('Customer').nullable()
})
