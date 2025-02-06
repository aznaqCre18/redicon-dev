import * as yup from 'yup'
import { SupplierType } from '../supplier'
import { OutletType } from '../outlet/outlet'
import { ProductType, VariantResponseType } from '../productType'
import { UnitType } from '../unitType'

export interface PurchaseData {
  created_at?: string
  purchase_number: string
  grand_discount: number
  is_update_purchase_product: boolean
  payment_method: string
  outlet_id: number
  supplier_id: number
  purchase_items: PurchaseItem[]
}

export interface PurchaseDataUpdate extends PurchaseData {
  purchase_item_deleted: number[]
}

export interface PurchaseItem {
  product_id: number
  product_variant_id?: number
  quantity: number
  discount: number
  price: number
  name: string
}

export interface PurchaseDetailItem {
  id?: number
  product_id: number
  product_variant_id?: number
  quantity: number
  discount: number
  price: number
  name: string
  product: ProductTypeWithUnit
  product_variant: VariantResponseType
}

export interface ProductTypeWithUnit extends ProductType {
  unit: UnitType
}

export interface PurchaseDetailData {
  purchase_number: string
  grand_discount: number
  is_update_purchase_product: boolean
  payment_method: string
  outlet_id: number
  supplier_id: number
  purchase_items: PurchaseDetailItem[]
}

export interface PurchaseDetailType extends PurchaseDetailData {
  id: number
  supplier: SupplierType
  outlet: OutletType
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number | null
}

export const PurchaseSchema = yup.object<PurchaseData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  purchase_number: yup.string().nullable().label('Purchase Number'),
  payment_method: yup.string().nullable().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  supplier_id: yup.number().required().label('Supplier'),
  grand_discount: yup.number().required().label('Global Discount'),
  is_update_purchase_product: yup.boolean().required().label('Is Update Purchase Product'),
  purchase_items: yup
    .array(
      yup.object<PurchaseItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        quantity: yup.number().required(),
        discount: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .min(1)
    .label('Purchase Item')
})

export const PurchaseUpdateSchema = yup.object<PurchaseData>().shape({
  created_at: yup.string().nullable().label('Created At'),
  purchase_number: yup.string().nullable().label('Purchase Number'),
  payment_method: yup.string().required().label('Payment Method'),
  outlet_id: yup.number().required().label('Outlet'),
  supplier_id: yup.number().required().label('Supplier'),
  grand_discount: yup.number().required().label('Global Discount'),
  is_update_purchase_product: yup.boolean().required().label('Is Update Purchase Product'),
  purchase_items: yup
    .array(
      yup.object<PurchaseItem>().shape({
        product_id: yup.number().required(),
        product_variant_id: yup.number().nullable(),
        quantity: yup.number().required(),
        discount: yup.number().required(),
        price: yup.number().required(),
        name: yup.string().required()
      })
    )
    .label('Purchase Item')
})
