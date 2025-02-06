import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import { MetaType } from 'src/types/pagination/meta'
import { IDepartment } from 'src/types/apps/departmentType'

export interface patchDepartment {
  id?: number | null | undefined
  request?: any
}

export const departmentService = {
  getListDepartment(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<IDepartment> }>('/department', {
      params: options
    })
  },
  postDepartment(request: any) {
    return api.post('/department', request)
  },
  getDepartment(id: string) {
    return api.get(`/user/department/${id}`)
  },
  deleteDepartment(id: string) {
    return api.delete(`/department/${id}`)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/department`, ids)
  },
  patchDepartment(patchUser: patchDepartment) {
    return api.patch(`/department/${patchUser.id}`, patchUser.request)
  },

  updateStatusDepartment(data: { id: number; status: boolean }) {
    return api.patch(`/department/${data.id}`, { is_active: data.status })
  }

  // getCustomerDepartment(
  //   options?: PageOptionRequestType
  // ): Promise<{ data: { meta: MetaType; data: Array<IDepartment> } }> {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       resolve({ data: { meta: departmentResponse.meta, data: departmentResponse.data } })
  //     }, 500)
  //   })
  // return api.get<{ meta: MetaType; data: Array<IDepartment> }>('/department', {
  //   params: options
  // })
  // }
}
