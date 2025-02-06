import * as yup from 'yup'

export type StockType = {
  id: number | null
  product_variant_id: number
  warehouse_id: number
  quantity: number
}

export const StockSchema = yup.object<StockType>().shape({
  id: yup.number().nullable(),
  product_variant_id: yup.number().required().label('Product Variant'),
  warehouse_id: yup.number().required().label('Warehouse'),
  quantity: yup.number().required().label('Quantity')
})
