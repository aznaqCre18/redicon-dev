import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import {
  ReportCommissionDetailResponseType,
  ReportCommissionResponseType
} from 'src/types/apps/report/comission'

export const reportCommissionService = {
  getSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCommissionResponseType }>(
      '/report/commissions/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getDetail(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCommissionDetailResponseType }>(
      '/report/commissions/sales/detail',
      {
        params: { ...newOptions }
      }
    )
  }
}
