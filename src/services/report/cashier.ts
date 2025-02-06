import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import {
  ReportCashierCashDetailResponseType,
  ReportCashierCashDetailSummary,
  ReportCashierCashResponseType,
  ReportCashierCloseSummary,
  ReportCashierPerShiftResponseType,
  ReportSalesPerCashierResponseType,
  ReportTotalProductCashier
} from 'src/types/apps/report/cashier'

export const reportCashierService = {
  getSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerCashierResponseType }>(
      '/report/cashier/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getPerShift(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCashierPerShiftResponseType }>(
      '/report/cashier/shift/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getCashierCash(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCashierCashResponseType }>(
      '/report/cashier/cash',
      {
        params: { ...newOptions }
      }
    )
  },

  getCashierCashDetail(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCashierCashDetailResponseType }>(
      '/report/cashier/cash/detail',
      {
        params: { ...newOptions }
      }
    )
  },

  getCashierCashDetailSummary(options?: PageOptionRequestType) {
    const { created_at } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportCashierCashDetailSummary }>(
      '/report/cashier/cash/detail/summary',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  getCashierClose(options?: PageOptionRequestType) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, limit, page, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    // const end_date = explode[1]
    const newOptions = { ...rest, date: start_date }

    return api.get<{ meta: MetaType; data: ReportCashierCloseSummary }>(
      '/report/cashier/close',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  getCashierCloseProduct(options?: PageOptionRequestType) {
    console.log(options)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, limit, page, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    // const end_date = explode[1]
    const newOptions = { ...rest, date: start_date }

    return api.get<{ meta: MetaType; data: ReportTotalProductCashier }>(
      '/report/cashier/close/product',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  exportReportCashierSummaryExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-sales-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportCashierSummaryPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-sales-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportCashierPerShiftExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-shift-sales-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportCashierPerShiftPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-shift-sales-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportCashCashierExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-cash-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportCashCashierPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/cashier-cash-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  }
}
