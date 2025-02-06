import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import {
  RefundType,
  ReportProductSalesSummaryType,
  ReportReturnSalesPerCustomerResponseType,
  ReportReturnSalesResponseType,
  ReportSalePerPeriodSummary,
  ReportSalesPerBrandResponseType,
  ReportSalesPerCategoryResponseType,
  ReportSalesPerCustomerResponseType,
  ReportSalesPerOrderTypeResponseType,
  ReportSalesPerOutletResponseType,
  ReportSalesPerPeriodResponseType,
  ReportSalesPerRefundResponseType,
  ReportSalesPerRefundSummaryType,
  ReportSalesPerTerminalResponseType,
  ReportSalesPerUserResponseType,
  ReportSalesPerVoidResponseType,
  ReportSalesPerVoidSummaryType,
  ReportSalesResponseType,
  VoidType
} from 'src/types/apps/report/product-sales'

export const reportProductSalesService = {
  getList(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesResponseType }>('/report/product/sales', {
      params: { ...newOptions }
    })
  },

  getSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    newOptions.limit = undefined
    newOptions.page = undefined
    newOptions.sort = undefined
    newOptions.order = undefined

    return api.get<{ data: ReportProductSalesSummaryType }>('/report/product/sales/summary', {
      params: newOptions
    })
  },

  getSalesPerPeriod(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerPeriodResponseType }>('/report/period', {
      params: { ...newOptions }
    })
  },

  getSalesPerPeriodSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalePerPeriodSummary }>(
      '/report/period/summary',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  getSalesPerCustomer(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerCustomerResponseType }>(
      '/report/customer/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getSalesPerUser(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerUserResponseType }>('/report/user/sales', {
      params: { ...newOptions }
    })
  },

  getSalesPerCategory(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerCategoryResponseType }>(
      '/report/category/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getSalesPerBrand(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerBrandResponseType }>(
      '/report/brand/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getSalesPerOutlet(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerOutletResponseType }>(
      '/report/outlet/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getSalesPerTerminal(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerTerminalResponseType }>(
      '/report/terminal/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getSalesPerVoid(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerVoidResponseType }>('/report/void', {
      params: { ...newOptions }
    })
  },

  getSalesPerVoidSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    newOptions.limit = undefined
    newOptions.page = undefined
    newOptions.sort = undefined
    newOptions.order = undefined

    return api.get<{ data: ReportSalesPerVoidSummaryType }>(
      '/report/void/summary',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  getVoidDetail(id: number) {
    return api.get<{ data: VoidType }>('/report/void/' + id + '/detail', undefined, true)
  },

  getSalesPerRefund(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    return api.get<{ meta: MetaType; data: ReportSalesPerRefundResponseType }>('/report/refund', {
      params: { ...newOptions }
    })
  },

  getSalesPerRefundSummary(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    newOptions.limit = undefined
    newOptions.page = undefined
    newOptions.sort = undefined
    newOptions.order = undefined

    return api.get<{ data: ReportSalesPerRefundSummaryType }>(
      '/report/refund/summary',
      {
        params: { ...newOptions }
      },
      true
    )
  },

  getRefundDetail(id: number) {
    return api.get<{ data: RefundType }>('/report/refund/' + id + '/detail', undefined, true)
  },

  getReturnSales(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const order = 'created_at'
    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date, order }

    return api.get<{ meta: MetaType; data: ReportReturnSalesResponseType }>(
      '/report/return-sales',
      {
        params: { ...newOptions }
      }
    )
  },

  getReturnSalesPerCustomer(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date, order: undefined }

    return api.get<{ meta: MetaType; data: ReportReturnSalesPerCustomerResponseType }>(
      '/report/return-sales/customer',
      {
        params: { ...newOptions }
      }
    )
  },

  // order-type
  getSalesPerOrderType(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const order = 'created_at'
    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date, order }

    return api.get<{ meta: MetaType; data: ReportSalesPerOrderTypeResponseType }>(
      '/report/order-type/sales',
      {
        params: { ...newOptions }
      }
    )
  },

  exportReportReturnSalesExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/return-sales-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportReturnSalesPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/return-sales-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportReturnSalesPerCustomerExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/return-sales-per-customer-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportReturnSalesPerCustomerPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/return-sales-per-customer-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  }
}
