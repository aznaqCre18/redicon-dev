import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import { CostCenterPatch, ICostCenter } from 'src/types/apps/costCenterType'
import { MetaType } from 'src/types/pagination/meta'

export const costCenterService = {
  getListCostCenter(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<ICostCenter> }>('/cost-center', {
      params: options
    })
  },

  postCostCenter(request: any) {
    return api.post('/cost-center', request)
  },

  patchCostCenter(patchUser: CostCenterPatch) {
    return api.patch(`/cost-center/${patchUser.id}`, patchUser.request)
  },

  updateStatusCostCenter(data: { id: number; status: boolean }) {
    return api.patch(`/cost-center/${data.id}`, { is_active: data.status })
  },

  deleteCostCenter(id: string) {
    return api.delete(`/cost-center/${id}`)
  },

  deleteBatchCostCenter(ids: number[]) {
    return api.deleteBatch(`/cost-center`, ids)
  }
}
