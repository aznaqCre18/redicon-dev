import { BrandType } from '../brandType'
import { CategoryType } from '../categoryType'
import { ProductOutletMappingType } from '../productType'
import { UnitType } from '../unitType'

export type StockProduct = {
  id: number
  product_variant_id?: number
  name: string
  sku: string
  vsku?: string
  attributes:
    | {
        name: string
        value: string
      }[]
    | null
  category_id: number
  category_name: string | undefined
  brand_id: number
  unit_id: number
  stock: number
  vendor_id: number
  is_variant: boolean
  total_in_carts: number
  total_in_order_completed: number
  total_in_order_on_delivery: number
  total_in_order_on_process: number
  total_in_order_unpaid: number
  created_at: string
  updated_at: string
  media: string[]
}

export type StockDetail = {
  key: number
  product: StockProduct
  category: CategoryType
  brand: BrandType
  unit: UnitType
  outlets: ProductOutletMappingType[]
}

export type StockDetailWithKey = {
  key: number
  product: StockProduct
  category: CategoryType
  brand: BrandType
  unit: UnitType
  outlets: ProductOutletMappingType[]
}

export const addKeyToStockDetail = (stockDetail: StockDetail[]): StockDetailWithKey[] => {
  return stockDetail.map((stock, index) => {
    return { ...stock, key: index + 1 }
  })
}
