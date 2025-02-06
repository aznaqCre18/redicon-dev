import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import { ProductHistoryDetail } from 'src/types/apps/product/history-stock'

export const historyStockService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ProductHistoryDetail[] }>(
      '/product/history-stocks/detail',
      {
        params: options
      }
    )
  }
}
