import * as yup from 'yup'

export type BannerData = {
  name: string
  description: string
  url: string
  status: boolean
}

export interface BannerType extends BannerData {
  id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export type BannerImageData = {
  banner_id: number
  device_type: string
  status: boolean
}

export interface BannerImageType extends BannerImageData {
  id: number
  image: string
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number | null
}

export type BannerDetailType = {
  banner_master: BannerType
  banner_images: BannerImageType[]
}

export const BannerSchema = yup.object<BannerData>().shape({
  name: yup.string().required().label('Banner Name'),
  description: yup.string().nullable().label('Description'),
  url: yup.string().required().label('Banner Link'),
  status: yup.boolean().required().label('Status')
})
