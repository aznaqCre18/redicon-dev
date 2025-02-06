import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import { CostCenterPatch, ICostCenter } from 'src/types/apps/costCenterType'
import { MetaType } from 'src/types/pagination/meta'
import { IGLAccountPatch } from 'src/types/apps/glAccountType'

export const glAccountService = {
  getListGLAccount(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<ICostCenter> }>('/general-ledger-account', {
      params: options
    })
  },

  postGLAccount(request: any) {
    return api.post('/general-ledger-account', request)
  },

  patchGLAccount(patchUser: IGLAccountPatch) {
    return api.patch(`/general-ledger-account/${patchUser.id}`, patchUser.request)
  },

  updateStatusGLAccount(data: { id: number; status: boolean }) {
    return api.patch(`/general-ledger-account/${data.id}`, { is_active: data.status })
  },

  deleteGLAccount(id: string) {
    return api.delete(`/general-ledger-account/${id}`)
  },

  deleteBatchGLAccount(ids: number[]) {
    return api.deleteBatch(`/general-ledger-account`, ids)
  }
}
