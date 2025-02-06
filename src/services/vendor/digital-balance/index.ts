import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../../core'
import { MetaType } from 'src/types/pagination/meta'
import { DigitalBalanceDetailType } from 'src/types/apps/vendor/digital-balance'

export const digitalBalanceService = {
  getList(options: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: DigitalBalanceDetailType[] }>(
      '/vendor/digital-balance/detail',
      {
        params: options
      }
    )
  }
}
