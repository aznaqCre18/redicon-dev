import { BrandType } from 'src/types/apps/brandType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { CartItemDetailType } from 'src/types/apps/cartItemType'

export const cartItemService = {
  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CartItemDetailType> }>(
      '/customer/cart-item/detail',
      {
        params: options
      }
    )
  },

  post(request: any) {
    return api.post('/customer/cart-item', request)
  },

  patch(data: BrandType) {
    return api.patch(`/customer/cart-item/${data.id}`, data)
  },

  delete(id: string) {
    return api.delete(`/customer/cart-item/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/customer/cart-item`, ids)
  }
}
