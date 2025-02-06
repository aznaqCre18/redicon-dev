import { LabelType } from 'src/types/apps/product/labelType'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'

export const labelService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: LabelType[] }>('/product/label', {
      params: options
    })
  }
}
