import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import {
  BannerType,
  BannerData,
  BannerImageData,
  BannerDetailType
} from 'src/types/apps/bannerType'
import { MetaType } from 'src/types/pagination/meta'

export const bannerService = {
  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: BannerDetailType[] }>('/vendor/banner-master/detail', {
      params: options
    })
  },

  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: BannerType[] }>('/vendor/banner-master', {
      params: options
    })
  },

  post(data: BannerData) {
    return api.post('/vendor/banner-master', data)
  },

  delete(id: number) {
    return api.delete('/vendor/banner-master/' + id)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/banner-master`, ids)
  },

  patch(data: { id: number; data: BannerData }) {
    return api.patch('/vendor/banner-master/' + data.id, data.data)
  },

  uploadImage(req: { data: BannerImageData; image: File }) {
    const formData = new FormData()
    formData.append('image', req.image)
    formData.append('banner_id', req.data.banner_id.toString())
    formData.append('device_type', req.data.device_type)
    formData.append('status', req.data.status.toString())

    return api.post('/vendor/banner-image', formData)
  },

  updateImage(req: { id: number; data: BannerImageData; image: File }) {
    const formData = new FormData()
    formData.append('image', req.image)
    formData.append('device_type', req.data.device_type)
    formData.append('status', req.data.status.toString())

    return api.patch('/vendor/banner-image/' + req.id, formData)
  },

  setStatus(data: { id: number; status: boolean }) {
    return api.patch(`/vendor/banner-master/${data.id}`, {
      status: data.status
    })
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/vendor/banner-master/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
