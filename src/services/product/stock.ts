import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import { StockDetail } from 'src/types/apps/product/stock'

export const stockService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: StockDetail[] }>('/product/product-variants', {
      params: options
    })
  }
}
