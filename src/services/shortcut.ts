import { PageOptionRequestType } from 'src/types/pagination/pagination'
import api from './core'
import { MetaType } from 'src/types/pagination/meta'
import { ShortcutData, ShortcutType } from 'src/types/apps/shortcutType'

export const shortcutService = {
  getListDetail(options?: PageOptionRequestType) {
    return api.get<{ data: ShortcutType[] }>('/vendor/shortcut/detail', {
      params: options
    })
  },

  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: ShortcutType[] }>('/vendor/shortcut', {
      params: options
    })
  },

  post(data: { data: ShortcutData; file: File }) {
    const formData = new FormData()
    formData.append('name', data.data.name)
    formData.append('slug', data.data.slug)
    formData.append('description', data.data.description)
    formData.append('url', data.data.url)
    formData.append('status', String(data.data.status))
    formData.append('image', data.file)

    return api.postFormData('/vendor/shortcut', formData)
  },

  delete(id: number) {
    return api.delete('/vendor/shortcut/' + id)
  },
  deleteBatch(ids: number[]) {
    return api.deleteBatch(`/vendor/shortcut`, ids)
  },

  patch(data: { id: number; data: ShortcutData; file?: File }) {
    const formData = new FormData()
    formData.append('name', data.data.name)
    formData.append('slug', data.data.slug)
    formData.append('description', data.data.description)
    formData.append('url', data.data.url)
    formData.append('status', String(data.data.status))
    if (data.file) formData.append('image', data.file)

    return api.patchFormData('/vendor/shortcut/' + data.id, formData)
  },

  setStatus(data: { id: number; status: boolean }) {
    const formData = new FormData()
    formData.append('status', String(data.status))

    return api.patch(`/vendor/shortcut/${data.id}`, formData)
  },

  batchUpdateStatus(data: { ids: number[]; status: boolean }) {
    return api.patch(
      `/vendor/shortcut/bulk-update-status`,
      {
        ids: data.ids,
        is_active: data.status
      },
      undefined,
      true
    )
  }
}
