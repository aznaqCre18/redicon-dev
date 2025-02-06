import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { EmployeeData, EmployeeRoleType, EmployeeType } from 'src/types/apps/employee'

export const employeeService = {
  getListRole(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<EmployeeRoleType> }>(
      '/employees/roles',
      {
        params: { ...options, active_status: true }
      },
      true
    )
  },
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<EmployeeType> }>('/employees', {
      params: options
    })
  },
  getListActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<EmployeeType> }>('/employees', {
      params: { ...options, active_status: true }
    })
  },

  getOne(id: number) {
    return api.get<{ data: EmployeeType }>(`/employees/${id}`, undefined, true)
  },

  create(request: EmployeeData) {
    return api.post('/employees', request)
  },

  delete(id: number) {
    return api.delete(`/employees/${id}`, undefined, true)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/employees`, ids)
  },
  update(request: { id: number; data: EmployeeData }) {
    return api.patch(`/employees/${request.id}`, { ...request.data }, undefined, true)
  },
  setStatus(data: { id: number; status: boolean }) {
    return api.patch(
      `/employees/${data.id}`,
      {
        active_status: data.status
      },
      undefined,
      true
    )
  },

  exportExcel() {
    return api.get('/employees/export', { responseType: 'blob' }, true)
  }
}
