import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from '../core'
import {
  ReportMutationStockProductResponseType,
  ReportMutationStockProductVariantResponseType,
  ReportStockProductResponseType,
  ReportStockProductSummaryType,
  ReportStockProductVariantResponseType,
  ReportStockProductVariantSummaryType
} from 'src/types/apps/report/stock'

export const reportStockService = {
  getProducts(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportStockProductResponseType }>(
      '/report/product/stock/v2',
      {
        params: { ...options, order: 'product_stock_value' }
      },
      true
    )
  },
  getProductsSummary(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportStockProductSummaryType }>(
      '/report/product/stock/v2/summary',
      {
        params: { ...options, limit: undefined, page: undefined, sort: undefined, order: undefined }
      },
      true
    )
  },
  getProductVariants(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportStockProductVariantResponseType }>(
      '/report/product/variant/stock/v2',
      {
        params: { ...options, order: 'product_variant_stock_value' }
      },
      true
    )
  },
  getProductVariantsSummary(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportStockProductVariantSummaryType }>(
      '/report/product/variant/stock/v2/summary',
      {
        params: { ...options, limit: undefined, page: undefined, sort: undefined, order: undefined }
      },
      true
    )
  },
  getMutationProducts(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportMutationStockProductResponseType }>(
      '/report/product/stock/mutation',
      {
        params: { ...options, order: 'remaining_stock' }
      }
    )
  },
  getMutationProductVariants(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ReportMutationStockProductVariantResponseType }>(
      '/report/product/variant/stock/mutation',
      {
        params: { ...options, order: 'remaining_stock' }
      }
    )
  },

  exportReportStockProcutExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/remaining-stock-product-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportStockProcutPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/remaining-stock-product-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportStockProductVariantExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/remaining-stock-product-variant-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportStockProductVariantPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/remaining-stock-product-variant-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportMutationStockProductExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/product-stock-mutation-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportMutationStockProductPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/product-stock-mutation-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportMutationStockProductVariantExcel(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/product-variant-stock-mutation-excel',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportMutationStockProductVariantPdf(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]

    const newOptions = { ...rest, start_date, end_date }

    return api.get(
      '/report/export/product-variant-stock-mutation-html',
      {
        params: { ...rest, ...newOptions, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportStockProductValueExcel(options?: PageOptionRequestType) {
    return api.get(
      '/report/export/product-stock-value-excel',
      {
        params: { ...options, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportStockProductValuePdf(options?: PageOptionRequestType) {
    return api.get(
      '/report/export/product-stock-value-html',
      {
        params: { ...options, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  },

  exportReportStockProductVariantValueExcel(options?: PageOptionRequestType) {
    return api.get(
      '/report/export/product-variant-stock-value-excel',
      {
        params: { ...options, limit: undefined, page: undefined },
        responseType: 'blob'
      },
      true
    )
  },

  exportReportStockProductVariantValuePdf(options?: PageOptionRequestType) {
    return api.get(
      '/report/export/product-variant-stock-value-html',
      {
        params: { ...options, limit: undefined, page: undefined },
        responseType: 'text'
      },
      true
    )
  }
}
