import { WHType } from 'src/types/apps/warehouseType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'

export interface patchType {
  id: string
  request: any
}

export const warehouseService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<WHType> }>('/product/warehouse', {
      params: options
    })
  },
  postItem(request: any) {
    return api.post('/product/warehouse', request)
  },
  getItem(id: string) {
    return api.get(`/product/warehouse/${id}`)
  },
  deleteItem(id: string) {
    return api.delete(`/product/warehouse/${id}`)
  },
  patchItem(patchData: patchType) {
    return api.patch(`/product/warehouse/${patchData.id}`, patchData.request)
  }
}
