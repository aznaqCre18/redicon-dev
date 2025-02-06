// import * as yup from 'yup'
// import { OutletType } from './outletType'

// export type MembershipPriceType = {
//   '1': number
//   '2': number
// }

// export type ProductVariantData = {
//   product_id: number
//   sku: string
//   base_price: number
//   images: Array<string>
//   membership_price: MembershipPriceType
//   stock: number
// }

// export interface ProductVariantType extends ProductVariantData {
//   id: number
//   created_at: Date
//   updated_at: Date
//   outlets: OutletType[]
// }

// export const MembershipPriceSchema = yup.object<MembershipPriceType>().shape({
//   1: yup.number(),
//   2: yup.number()
// })

// export const ProductVariantSchema = yup.object<ProductVariantData>().shape({
//   id: yup.string().nullable(),
//   product_id: yup.string(),
//   sku: yup.string(),
//   base_price: yup.number().required(),
//   images: yup.string(),
//   membership_price: MembershipPriceSchema,
//   stock: yup.string().required()
// })
