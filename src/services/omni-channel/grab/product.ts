import api from '../core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { GrabProductData, GrabProductType } from 'src/types/omni-channel/grab/product'

const endpoint = '/v1/merchant_product'
type DataType = GrabProductType

export const productGrabService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: DataType[] }>(endpoint, {
      params: { ...options, merchant_id: 1, provider_id: 1 }
    })
  },

  get(sku: string) {
    return api.get<{ data: DataType }>(`${endpoint}/${sku}`, {
      params: { merchant_id: 1, provider_id: 1 }
    })
  },

  create(request: GrabProductData) {
    return api.post(endpoint, {
      ...request,
      merchant_id: 1,
      provider_id: 1,
      spu: request.channel_sku,
      msku: request.channel_sku,
      variation: request.channel_sku
    })
  },

  update(data: { id: number; request: GrabProductData }) {
    return api.put(`${endpoint}/${data.id}`, {
      ...data.request,
      merchant_id: 1,
      provider_id: 1,
      spu: data.request.channel_sku,
      msku: data.request.channel_sku,
      variation: data.request.channel_sku
    })
  },

  delete(id: number) {
    return api.delete(`${endpoint}/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.delete(`${endpoint}/batch`, { data: { ids } })
  }
}
