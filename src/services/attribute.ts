import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import { AttributeType } from 'src/types/apps/attributeType'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

export interface patchBrandType {
  id: string
  request: any
}

export interface AttributeRequestType extends PageOptionRequestType {
  name: string
}

export const attributeService = {
  getListAttribute(options?: AttributeRequestType) {
    return api.get<{ meta: MetaType; data: Array<AttributeType> }>(
      '/product/attribute?sort=ASC&order=id',
      {
        params: options
      }
    )
  },

  postAttribute(request: any) {
    return api.post('/product/attribute', request)
  },

  patchAttribute(data: AttributeType) {
    return api.patch(`/product/attribute/${data.id}`, data)
  },

  deleteAttribute(id: string) {
    return api.delete(`/product/attribute/${id}`)
  },

  deleteBatchAttribute(ids: number[]) {
    return api.deleteBatch(`/product/attribute`, ids)
  }
}
