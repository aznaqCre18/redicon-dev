import * as yup from 'yup'
import { OutletType } from './outlet/outlet'
import { CategoryType } from './categoryType'
import { BrandType } from './brandType'
import { UnitType } from './unitType'
import { t } from 'i18next'
import { SupplierType } from './supplier'
import { ProductExtraType } from './productExtra'

export type PriceMembershipType = {
  [key: string]: number
}

export type DiscountMembershipType = {
  discount_type: 'nominal' | 'percentage'
  discount: number
}

export type DiscountMembershipsType = {
  [key: string]: DiscountMembershipType
}

export type variantValueType = {
  name: string
  isActive: boolean
}

export type StockVariantType = {
  name: string
  color: string
  size: string
  stock: number
  sku: string
  product_price: number
}

export type WholesaleType = {
  min_qty: number
  price: number[]
}

export type WholesaleTypeRequest = {
  min_qty: number
  price: PriceMembershipType
}

type DimentionType = {
  length: number
  width: number
  height: number
}

export type AttributeType = {
  name: string
  value: string
}

export interface VariantType {
  id?: number
  product_id: number
  sku: string
  stock: number
  maximum_order: number | null
  price: PriceMembershipType
  attributes: AttributeType[]
}

export interface VariantWithoutMembershipType extends Omit<VariantType, 'price'> {
  price: number
}

export interface VariantTypeOnlyPriceAndStock {
  stock: number | undefined
  price: number[]
}
export interface VariantDataOnlyPriceAndStock {
  stock: number | undefined
  price: PriceMembershipType
}

export type ProductData = {
  name: string //
  category_id: number //
  brand_id: number //
  unit_id: number //
  supplier_id: number | null
  detail: string //
  price: PriceMembershipType
  discount_membership?: DiscountMembershipsType
  discount?: number //
  discount_type?: 'nominal' | 'percentage' | null //
  discount_start_date?: string | null //
  discount_end_date?: string | null //
  fix_tax: number //
  is_show_on_pos: boolean
  url_youtube: string | null
  product_type: 'STOCK' | 'NONSTOCK'
  stock: number | undefined //
  purchase_price: number //
  purchase_discount: number | null
  purchase_discount_type: 'nominal' | 'percentage' | null
  sku: string //
  minimum_order: number //
  maximum_order: number //
  wholesale_price: WholesaleTypeRequest[]
  weight: number //
  dimention?: DimentionType
  // dimention: DimentionType
  status: 'live' | 'draft' | 'archived'
  rack_position: string
  position: number | null
  notification: boolean
  is_best_seller?: boolean
  is_newest?: boolean
  is_promo?: boolean

  // commission
  commission_value: number | null
  commission_type: 'percentage' | 'nominal'

  product_extra_id: number | null

  selling_price: number
}

export interface ProductDataWithoutMembership
  extends Omit<ProductData, 'price' | 'supplier_id' | 'wholesale_price' | 'discount_membership'> {
  price: number
}

export interface VariantSchemaType {
  id?: number
  sku: string
  stock: number
  maximum_order: number | null
  price: number
  attributes: AttributeType[]
}

export type ProductSchemaType = {
  outlet_ids: number[]
  name: string
  category1_id: number
  category2_id?: number
  category3_id?: number
  brand_id: number
  unit_id: number
  supplier_id: number | null
  detail: string
  price: number[]
  price_discount: any
  price_discount_type: any
  fix_tax: number
  discount: number | null
  discount_percentage: number | null
  discount_type: 'nominal' | 'percentage' | null
  discount_start_date: string | null
  discount_end_date: string | null
  product_type: 'STOCK' | 'NONSTOCK'
  stock: number
  purchase_price: number
  purchase_discount: number | null
  purchase_discount_type: 'nominal' | 'percentage' | null
  sku: string
  minimum_order: number
  maximum_order: number
  wholesale_price: WholesaleType[]
  weight: number
  // dimention: DimentionType
  variants: VariantSchemaType[] | null
  status: 'live' | 'draft' | 'archived'
  rack_position: string
  position: number | null
  notification: boolean
  is_best_seller: boolean
  is_newest: boolean
  is_promo: boolean
  is_show_on_pos: boolean

  url_youtube: string | null

  // commission
  commission_value: number | null
  commission_type: 'percentage' | 'nominal'

  product_extra_id: number | null
  selling_price: number
}

export type ProductStockSchemaType = {
  stock: number | undefined
}

export type ProductPriceStockSchemaType = {
  variants: VariantTypeOnlyPriceAndStock[]
}

export interface ProductType extends ProductData {
  has_video: boolean
  stock: number
  id: number
  labels: string[]
  media: string[] | null
  created_at: string
  updated_at: string
  updated_by: number
}

export interface ProductWithoutMembershipType extends ProductDataWithoutMembership {
  has_video: boolean
  stock: number
  id: number
  labels: string[]
  media: string[] | null
  created_at: string
  updated_at: string
  updated_by: number
}

export interface ProductTypeIndex extends ProductData {
  id: number
  labels: string[]
  media: string[] | null
  index: number
  created_at: string
  updated_at: string
  updated_by: number
}

export type ProductOutletMappingType = {
  outlet: OutletType
  mapping: {
    id: number
    product_id: number
    outlet_id: number
  }
}

export interface VariantResponseType extends VariantType {
  id: number
  image: string
  created_at: Date
  updated_at: Date
}

export interface VariantResponseWithoutMembershipType extends Omit<VariantResponseType, 'price'> {
  price: number
}

export interface PiceProductType {
  id: number
  vendor_id: number
  name: string
  points: number
  price: number
  created_at: string
  created_by: number | null
  updated_at: string
  updated_by: number | null
}

export interface ProductDetailType {
  price: PiceProductType[]
  product: ProductType
  outlets: ProductOutletMappingType[]
  variants: VariantResponseType[]
  category: CategoryType
  supplier?: SupplierType
  brand: BrandType
  extra: ProductExtraType | null
  unit: UnitType
  commissions: {
    option_type: 'percentage' | 'nominal'
    option_value: number
  }[]
}

export interface ProductDetailWithoutMembershipType
  extends Omit<ProductDetailType, 'price' | 'product' | 'variants'> {
  price: number
  product: ProductWithoutMembershipType
  variants: VariantResponseWithoutMembershipType[]
}

export interface ProductStatusCountType {
  archived: number
  draft: number
  live: number
}

export const stockVariantSchema = yup.object<StockVariantType>().shape({
  name: yup
    .string()
    .required(`${t('Name')} ${t('is a required field')}`)
    // tidak boleh ada spasi di awal dan akhir
    .label(t('Name')),
  color: yup
    .string()
    .required(`${t('Color')} ${t('is a required field')}`)
    .label(t('Color')),
  size: yup
    .string()
    .required(`${t('Size')} ${t('is a required field')}`)
    .label(t('Size')),
  stock: yup
    .string()
    .required(`${t('Stock')} ${t('is a required field')}`)
    .label(t('Stock')),
  sku: yup
    .string()
    .required(`${t('VSKU')} ${t('is a required field')}`)
    .matches(/^(?!\s)(?!.*\s$).+$/, 'Tidak boleh ada spasi pada awal dan akhir kalimat')
    .label(t('VSKU')),
  product_price: yup
    .string()
    .required(`${t('Product Price')} ${t('is a required field')}`)
    .label(t('Product Price'))
})

export const wholesalePriceSchema = yup.object<WholesaleType>().shape({
  min: yup
    .string()
    .required(`${t('Min')} ${t('is a required field')}`)
    .label(t('Min')),
  max: yup
    .string()
    .required(`${t('Max')} ${t('is a required field')}`)
    .label(t('Max')),
  unit_price: yup
    .string()
    .required(`${t('Unit')} ${t('is a required field')}`)
    .label(t('Unit'))
})

export const ProductStockSchema = yup.object<ProductStockSchemaType>().shape({
  stock: yup
    .number()
    .nullable()
    // .required(`${t('Stock')} ${t('is a required field')}`)
    .label(t('Stock'))
})

export const ProductPriceStockSchema = yup.object<ProductPriceStockSchemaType>().shape({
  variants: yup
    .array(
      yup.object<VariantTypeOnlyPriceAndStock>().shape({
        stock: yup.number().nullable().label(t('Stock')),
        price: yup.array(yup.number())
      })
    )
    .required()
})

export const ProductSchema = yup.object<ProductSchemaType>().shape({
  // outlet_ids: yup
  //   .array(yup.number())
  //   .min(1)
  //   .required(`${t('Outlet')} ${t('is a required field')}`)
  //   .label('Outlet'),
  name: yup
    .string()
    .required(`${t('Product Name')} ${t('is a required field')}`)
    .matches(/^(?!\s)(?!.*\s$).+$/, 'Tidak boleh ada spasi pada awal dan akhir kalimat')
    .label(t('Product Name')),
  category1_id: yup
    .number()
    .required(`${t('Category')} ${t('is a required field')}`)
    .label(t('Category')),
  category2_id: yup.number().nullable().label(t('Category Tingakt 2')),
  category3_id: yup.number().nullable().label(t('Category Tingakat 3')),
  // brand_id: yup
  //   .number()
  //   .required(`${t('Brand')} ${t('is a required field')}`)
  //   .label(t('Brand')),
  unit_id: yup
    .number()
    .required(`${t('Unit')} ${t('is a required field')}`)
    .label(t('Unit')),
  detail: yup
    .string()
    // .required(`${t('Description')} ${t('is a required field')}`)
    // .notOneOf(['', '<p></p>', '<p></p>\n', null], `${t('Description')} ${t('is a required field')}`)
    .label(t('Description')),
  discount_percentage: yup.number().nullable(),
  discount: yup.number().nullable(),
  discount_type: yup.string().nullable(),
  discount_start_date: yup.string().nullable(),
  discount_end_date: yup.string().nullable(),
  fix_tax: yup.number().nullable(),
  product_type: yup.string().required().oneOf(['STOCK', 'NONSTOCK']),
  // stock: yup
  //   .number()
  //   .required(`${t('Stock')} ${t('is a required field')}`)
  //   .label(t('Stock')),
  purchase_price: yup.number().nullable(),
  purchase_discount: yup.number().nullable(),
  purchase_discount_type: yup.string().oneOf(['nominal', 'percentage']).nullable(),
  sku: yup
    .string()
    .required(`${t('MSKU')} ${t('is a required field')}`)
    .matches(/^(?!\s)(?!.*\s$).+$/, 'Tidak boleh ada spasi pada awal dan akhir kalimat')
    .label(t('MSKU')),
  // minimum_order: yup
  //   .number()
  //   .required(`${t('Minimum Order')} ${t('is a required field')}`)
  //   .label(t('Minimum Order')),
  maximum_order: yup.number().nullable(),
  wholesale_price: yup
    .array(
      yup.object<WholesaleType>().shape({
        min_qty: yup.number().nullable(),
        price: yup.array(yup.string()).nullable()
      })
    )
    .nullable(),
  // weight: yup
  //   .number()
  //   .required(`${t('Weight')} ${t('is a required field')}`)
  //   .label(t('Weight')),
  // dimention: yup.object().shape({
  //   length: yup.number().nullable(),
  //   width: yup.number().nullable(),
  //   height: yup.number().nullable()
  // }),
  // variants: yup
  //   .array(
  //     yup.object<VariantSchemaType>().shape({
  //       stock: yup
  //         .number()
  //         // .min(1, `${t('Stock')} ${t('must be greater than or equal to 1')}`)
  //         .required(`${t('Stock')} ${t('is a required field')}`)
  //         .label(t('Stock')),
  //       maximum_order: yup.number().nullable(),
  //       sku: yup.string().nullable(),
  //       // price: yup.array(yup.string().nullable()),
  //       price: yup.number().nullable(),
  //       attributes: yup.array(
  //         yup.object().shape({
  //           name: yup.string(),
  //           value: yup.string()
  //         })
  //       )
  //     })
  //   )
  //   .nullable(),
  // status: live, draft, archived
  status: yup.string().required().oneOf(['live', 'draft', 'archived']),
  rack_position: yup.string().nullable(),
  position: yup.number().nullable(),
  notification: yup.boolean().nullable(),
  is_best_seller: yup.boolean().nullable(),
  is_newest: yup.boolean().nullable(),
  is_promo: yup.boolean().nullable(),

  // commission
  commission_value: yup.number().nullable(),
  commission_type: yup.string().oneOf(['percentage', 'nominal']),

  url_youtube: yup.string().nullable(),

  product_extra_id: yup.number().nullable().label(t('Product Extra'))
})
