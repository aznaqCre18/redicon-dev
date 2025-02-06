export interface ReportProductItemType {
  id: number
  sku: string
  name: string
  category_id: number
  category_name: string
  product_sold_quantity: number
  product_sold_amount: number
}

export interface ReportProductResponseType {
  total_product_sold_quantity: number
  total_product_sold_amount: number
  product_sale_item: ReportProductItemType[]
}

export interface ReportProductVariantItemType {
  product_id: number
  product_sku: string
  product_name: string
  product_variant_id: number
  product_variant_sku: string
  product_variant_name: string
  category_id: number
  category_name: string
  product_variant_sold_quantity: number
  product_variant_sold_amount: number
}

export interface ReportProductVariantResponseType {
  total_product_variant_sold_quantity: number
  total_product_variant_sold_amount: number
  product_variant_sale_item: ReportProductVariantItemType[]
}
