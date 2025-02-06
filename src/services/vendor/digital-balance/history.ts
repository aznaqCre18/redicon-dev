import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../../core'
import { MetaType } from 'src/types/pagination/meta'
import { DigitalBalanceHistoryDetailType } from 'src/types/apps/vendor/digital-balance/history'

export const digitalBalanceHistoryService = {
  getList(options: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: DigitalBalanceHistoryDetailType[] }>(
      '/vendor/digital-balance-history/detail',
      {
        params: options
      }
    )
  }
}
