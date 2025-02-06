import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import { ReportPaymentTypeSalesResponseType } from 'src/types/apps/report/payment-sales'

export const reportPaymentService = {
  getPerPaymentType(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportPaymentTypeSalesResponseType }>(
      '/report/payment-type/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  exportReportSalesPerPaymentTypeExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/sales-per-payment-type-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportSalesPerPaymentTypePdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/sales-per-payment-type-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  }
}
