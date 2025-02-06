import * as yup from 'yup'
import { OutletType } from './outlet/outlet'

export type CategoryData = {
  name: string
  parent_id: number | null
  position: number
  is_active?: boolean | null
  fix_tax: number
  is_show_on_pos: boolean
  outlet_ids: number[]
}

export interface CategoryType extends CategoryData {
  id: number
  image: string
  name: string
  display_name?: string
  parent_id: number | null
  is_default: boolean
  is_active: boolean | null
  outlets: OutletType[]
  created_at: Date
  updated_at: Date
}

export interface CategoriesDetailType extends CategoryType {
  category: CategoryType
  children: CategoriesDetailType[]
}

// export const CategoryCreateSchema = yup.object<CategoryData>().shape({
//   name: yup.string().required().label('name'),
//   url: yup.string().required().label('Url'),
//   main_category_id: yup.number().nullable(),
//   sub_category_id: yup.number().nullable()
// })

export const CategorySchema = yup.object<CategoryData>().shape({
  name: yup.string().required().label('Category Name'),
  parent_id: yup.number().nullable().label('Parent Category'),
  position: yup.number().nullable().label('Position'),
  fix_tax: yup.number().nullable().label('Fix Tax')
  // outlet_ids: yup.array(yup.number()).min(1).label('Outlet').required().label('Outlet')
})

// export const CategoryPatchSchema = yup.object<CategoryData>().shape({
//   main_category_id: yup.number().required(),
//   sub_category_level1_id: yup.number().nullable(),
//   sub_category_level2_id: yup.number().nullable(),
//   category: CategorySchema.required()
// })
