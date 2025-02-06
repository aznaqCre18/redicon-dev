import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'

export type BusinessData = {
  title: number
  description: string
}

export interface BusinessType extends BusinessData {
  id: string
  created_at: string
  created_by?: string
  updated_at: string
  updated_by?: string
}

export const businessTypeService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<BusinessType> }>('/business-type', {
      params: options
    })
  },
  getOne(id: number) {
    return api.get<BusinessType>('/business-type/' + id)
  }
}
