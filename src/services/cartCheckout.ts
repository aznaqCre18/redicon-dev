import { BrandType } from 'src/types/apps/brandType'
import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { CartCheckoutDetailType } from 'src/types/apps/cartCheckoutType'

export const cartCheckoutService = {
  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CartCheckoutDetailType> }>(
      '/customer/cart-checkout/detail',
      {
        params: options
      }
    )
  },

  post(request: any) {
    return api.post('/customer/cart-checkout', request)
  },

  patch(data: BrandType) {
    return api.patch(`/customer/cart-checkout/${data.id}`, data)
  },

  delete(id: string) {
    return api.delete(`/customer/cart-checkout/${id}`)
  },

  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/customer/cart-checkout`, ids)
  }
}
