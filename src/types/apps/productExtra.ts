import * as yup from 'yup'

export interface ProductExtraData {
  outlet_ids: number[]
  name: string
  type: 'REQUIRED' | 'OPTIONAL'
  choice_type: 'SINGLE' | 'MULTIPLE'
  minimum_choice: number
  maximum_choice: number
  is_active: boolean
  items: ProductExtraItem[]
}

export interface ProductExtraItem {
  name: string
  selling_price: number
  is_active: boolean
}

export interface ProductExtraType extends ProductExtraData {
  id: number
  created_at: Date
  created_by: null
  updated_at: Date
  updated_by: null
}

export const ProductExtraSchema = yup.object<ProductExtraData>().shape({
  outlet_ids: yup.array().of(yup.number()).min(1).required().label('Outlet'),
  name: yup.string().required().label('Name'),
  type: yup.string().required().label('Type'),
  choice_type: yup.string().required().label('Choice Type'),
  minimum_choice: yup.number().required().label('Minimum Choice'),
  maximum_choice: yup.number().required().label('Maximum Choice'),
  is_active: yup.boolean().required().label('Status'),
  items: yup
    .array(
      yup.object<ProductExtraItem>().shape({
        name: yup.string().required().label('Name'),
        selling_price: yup.number().required().label('Selling Price'),
        is_active: yup.boolean().required().label('Status')
      })
    )
    .min(1)
    .required()
    .label('Items')
})
