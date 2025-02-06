import api from '../core'

export const productVariantService = {
  update(data: { id: number; data: any }) {
    return api.patch('/product/variant/' + data.id, data.data)
  }
}
