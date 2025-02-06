import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import { LogPriceType } from 'src/types/apps/product/log-price'

export const logPriceService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: LogPriceType[] }>('/product/log-selling-price', {
      params: options
    })
  }
}
