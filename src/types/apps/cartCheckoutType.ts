// import * as yup from 'yup'
import { CartItemType } from './cartItemType'
import { CustomerType } from './customerType'
import { ProductType, VariantResponseType } from './productType'

export type CartCheckoutType = {
  id: number
  customer_id: number | null
  customer_cart_id: number
  sub_total: number
  discount: number
  shipping: number
  tax: number
  total: number
  payment_total: number
  payment_change: number
  payment_method: string
  payment_status: string
  created_at: Date
  updated_at: Date
}

export type CartCheckoutDetailType = {
  cart_checkout: CartCheckoutType
  customer: CustomerType
  customer_cart_items: Array<{
    cart_item: CartItemType
    product: ProductType | null
    product_variant?: VariantResponseType
  }>
}

// export const BrandSchema = yup.object<BrandType>().shape({
//   id: yup.number().nullable(),
//   image: yup.string().required(),
//   name: yup.string().required().label('Name'),
//   code: yup.string().required().label('Code')
// })
