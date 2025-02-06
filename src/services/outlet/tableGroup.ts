import { TableGroupType, TableGroupData } from 'src/types/apps/outlet/tableGroup'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const tableGroupService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<TableGroupType> }>('/product/outlet/group-table', {
      params: options
    })
  },

  find(id: string) {
    return api.get<{ data: TableGroupType }>(`/product/outlet/group-table/${id}`)
  },

  create(request: TableGroupData) {
    return api.post('/product/outlet/group-table', request)
  },

  delete(id: number) {
    return api.delete(`/product/outlet/group-table/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/product/outlet/group-table`, ids)
  },

  update(request: { id: number; data: TableGroupData }) {
    return api.patch(`/product/outlet/group-table/${request.id}`, request.data)
  },

  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/outlet/group-table/${data.id}`, {
      status: data.status ? 'Active' : 'Inactive'
    })
  }
}
