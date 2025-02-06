import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { OwnerBankType } from 'src/types/apps/subscription/owner-bank'

export const bankOwnerService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OwnerBankType> }>('/owner-bank', {
      params: { ...options, status: true }
    })
  }
}
