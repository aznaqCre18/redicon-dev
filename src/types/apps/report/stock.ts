export type ReportStockProductSummaryType = {
  total_product_stock: number
  total_product_purchase?: number
  total_product_stock_value: number
}

export type ReportStockProductItemType = {
  id: number
  product_id: number
  product_sku: string
  product_name: string
  product_category_id: number
  product_category_name: string
  product_purchase_price: number
  product_stock: number
  product_stock_value: number
}

export type ReportStockProductResponseType = ReportStockProductSummaryType & {
  product_stock_item: ReportStockProductItemType[]
}

export type ReportStockProductVariantSummaryType = {
  total_product_variant_stock: number
  total_product_variant_purchase?: number
  total_product_variant_stock_value: number
}

export type ReportStockProductVariantItemType = {
  id: number
  product_id: number
  product_sku: string
  product_name: string
  product_stock: number
  product_stock_value: number
  product_variant_id: number
  product_variant_sku: string
  product_variant_attributes: ProductVariantAttribute[]
  product_category_id: number
  product_category_name: string
  product_variant_stock: number
  product_purchase_price: number
  product_variant_stock_value: number
}

export interface ProductVariantAttribute {
  name: string
  value: string
}

export type ReportStockProductVariantResponseType = ReportStockProductVariantSummaryType & {
  product_variant_stock_item: ReportStockProductVariantItemType[]
}

// Mutation
export type ReportMutationStockProductSummaryType = {
  initial_stock: number
  stock_in: number
  stock_out: number
  remaining_stock: number
}

export type ReportMutationStockProductItemType = {
  id: number
  product_id: number
  product_sku: string
  product_name: string
  initial_stock: number
  stock_in: number
  stock_out: number
  remaining_stock: number
}

export type ReportMutationStockProductResponseType = ReportMutationStockProductSummaryType & {
  product_stock_mutation_item: ReportMutationStockProductItemType[]
}

export type ReportMutationStockProductVariantSummaryType = {
  initial_stock: number
  stock_in: number
  stock_out: number
  remaining_stock: number
}

export type ReportMutationStockProductVariantItemType = {
  id: number
  product_id: number
  product_sku: string
  product_name: string
  product_variant_id: number
  product_variant_sku: string
  product_variant_attributes: ProductVariantAttribute[]
  initial_stock: number
  stock_in: number
  stock_out: number
  remaining_stock: number
}

export interface ProductVariantAttribute {
  name: string
  value: string
}

export type ReportMutationStockProductVariantResponseType =
  ReportMutationStockProductVariantSummaryType & {
    product_variant_stock_mutation_item: ReportMutationStockProductVariantItemType[]
  }
