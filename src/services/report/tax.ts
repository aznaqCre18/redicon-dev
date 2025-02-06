import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import { ReportTaxResponseType, ReportTaxSummaryType } from 'src/types/apps/report/tax'

export const reportTaxService = {
  get(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportTaxResponseType }>('/report/tax', {
      params: { ...newOptions }
    })
  },
  getSummary(options?: PageOptionRequestType) {
    const { created_at } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportTaxSummaryType }>(
      '/report/tax/summary',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  exportReportTaxExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/tax-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportTaxPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/tax-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  }
}
