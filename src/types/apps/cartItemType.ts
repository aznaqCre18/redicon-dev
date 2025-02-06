// import * as yup from 'yup'
import { ProductType, VariantResponseType } from './productType'

export type CartItemType = {
  id: number
  cart_id: number | null
  customer_promo_code_id: number
  product_id: number
  quantity: number
  name: string
  price: number
  note: string
  product_variant_id: number
  created_at: Date
  expired_at: Date
  updated_at: Date
}

export type CartItemDetailType = {
  cart_item: CartItemType
  product: ProductType
  product_variant: VariantResponseType
}

// export const BrandSchema = yup.object<BrandType>().shape({
//   id: yup.number().nullable(),
//   image: yup.string().required(),
//   name: yup.string().required().label('Name'),
//   code: yup.string().required().label('Code')
// })
