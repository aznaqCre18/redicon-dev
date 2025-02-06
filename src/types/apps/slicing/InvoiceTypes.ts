import { ProductDetailType } from '../productType'

export type InvoiceType = {
  discount: number | null
  qty: number
  total: number
  product: ProductDetailType
  variant_id?: number
}
