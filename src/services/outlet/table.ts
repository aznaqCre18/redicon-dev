import { TableType, OneCreateTableData } from 'src/types/apps/outlet/table'
import api from '../core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export const tableService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<TableType> }>('/product/outlet/table', {
      params: options
    })
  },

  find(id: string) {
    return api.get<{ data: TableType }>(`/product/outlet/table/${id}`)
  },

  create(data: OneCreateTableData) {
    return api.post(`/product/outlet/table/single`, data, undefined)
  },

  delete(id: number) {
    return api.delete(`/product/outlet/table/${id}`, undefined, true)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/product/outlet/table`, ids)
  },

  update(request: { id: number; data: OneCreateTableData }) {
    return api.patch(`/product/outlet/table/single/${request.id}`, request.data, undefined)
  },

  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/product/outlet/table/${data.id}`, {
      status: data.status ? 'Active' : 'Inactive'
    })
  }
}
