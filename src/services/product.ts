import {
  PriceMembershipType,
  ProductStatusCountType,
  ProductDetailType,
  ProductType,
  VariantWithoutMembershipType,
  ProductTypeIndex,
  ProductDataWithoutMembership
} from 'src/types/apps/productType'
import api from './core'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { ProductOutletType } from 'src/types/apps/productOutletType'

export interface patchProductType {
  id: number
  request: any
  image?: File
}

export interface AddProductMediaType {
  id: number
  file: File[]
}

export interface AddProductMediaWithIndexType {
  id: number
  file: File
  index: number
}

export interface UpdateProductStatus {
  id: number
  status: string
}

const convertValidParamsProduct = (options: any) => {
  const { labels, ...rest } = options || ({} as any)

  if (labels && labels == 'video') {
    options = {
      ...rest,
      has_video: 'true'
    }
  }

  return options
}

export const productService = {
  getListProduct(options?: PageOptionRequestType) {
    options = convertValidParamsProduct(options)

    return api.get<{ meta: MetaType; data: Array<ProductType> }>('/product', {
      params: options
    })
  },

  getListProductActive(options?: PageOptionRequestType) {
    options = convertValidParamsProduct(options)

    return api.get<{ meta: MetaType; data: Array<ProductType> }>('/product', {
      params: { ...options, status: 'live' }
    })
  },

  getListProductDetail(options?: PageOptionRequestType) {
    options = convertValidParamsProduct(options)

    return api.get<{ meta: MetaType; data: Array<ProductDetailType> }>('/product/detail', {
      params: options
    })
  },

  getProductStatusCount(options?: PageOptionRequestType) {
    options = convertValidParamsProduct(options)

    return api.get<{ data: ProductStatusCountType }>('/product/status-count', {
      params: options
    })
  },

  getProduct(id: string | undefined) {
    return api.get<{ data: ProductType }>(`/product/${id}`)
  },

  getProductDetail(id: string | number | undefined) {
    if (id) return api.get<{ data: ProductDetailType }>(`/product/${id}/detail`)
  },

  postProduct(request: ProductDataWithoutMembership) {
    return api.post('/product', {
      ...request,
      product_extra_id: request.product_extra_id == 0 ? undefined : request.product_extra_id
    })
  },

  deleteProduct(id: number) {
    return api.delete(`/product/${id}`)
  },

  patchBatchStatus(patchCustomer: UpdateProductStatus[]) {
    return api.patch(`/product`, patchCustomer)
  },

  patchProduct(patchData: patchProductType) {
    return api.patch(`/product/${patchData.id}`, patchData.request)
  },

  updatePriceProduct(patchData: { id: number; price: PriceMembershipType }) {
    return api.patch(`/product/${patchData.id}`, {
      price: patchData.price
    })
  },

  updatePurchasePriceProduct(patchData: { id: number; purchase_price: number }) {
    return api.patch(`/product/${patchData.id}`, {
      purchase_price: patchData.purchase_price
    })
  },

  updateStock(patchData: { id: number; stock: number; type: 'product' | 'variant' }) {
    if (patchData.type === 'product')
      return api.patch(`/product/${patchData.id}`, { stock: patchData.stock })
    else return api.patch(`/product/variant/${patchData.id}`, { stock: patchData.stock })
  },

  updateStockProduct(patchData: { id: number; stock: number }) {
    return api.patch(`/product/${patchData.id}`, { stock: patchData.stock })
  },

  addProductMedia(patchData: AddProductMediaType) {
    const formData = new FormData()
    patchData.file.forEach(file => {
      formData.append('file', file)
    })

    return api.postFormData<{ data: ProductType }>(`/product/${patchData.id}/media`, formData)
  },

  async addProductMediaWithIndex(patchData: AddProductMediaWithIndexType) {
    const formData = new FormData()
    formData.append('file', patchData.file)

    const response = await api.postFormData<{ data: ProductType }>(
      `/product/${patchData.id}/media`,
      formData
    )
    const responseData: ProductTypeIndex = { ...response.data.data, index: patchData.index }

    return responseData
  },

  updateProductMediaVideo(patchData: AddProductMediaType) {
    const formData = new FormData()
    patchData.file.forEach(file => {
      formData.append('file', file)
    })

    return api.postFormData(`/product/${patchData.id}/media/video`, formData)
  },

  deleteProductMedia(request: { id: number; medias: string[] }) {
    return api.deleteBatch(`/product/${request.id}/media`, { media: request.medias })
  },

  updateProductMediaSequence(request: { id: number; medias: string[] }) {
    return api.patch(
      `/product/${request.id}/media/sequence`,
      request.medias.map(media => ({ media: media }))
    )
  },

  postProductVariant(data: { request: VariantWithoutMembershipType; image?: File }) {
    data.request.stock = parseInt(data.request.stock.toString())
    const result = api.post('/product/variant', data.request)
    result.then(response => {
      const responseData: any = response.data

      if (data.image) {
        const formData = new FormData()
        formData.append('file', data.image)

        api.patchFormData(`/product/variant/${responseData.data.id}/image`, formData)
      }
    })

    return result
  },

  patchProductVariant(patchData: patchProductType) {
    Object.keys(patchData.request.price).forEach(key => {
      patchData.request.price[key] = parseInt(patchData.request.price[key].toString())
    })
    if (patchData.request.stock) patchData.request.stock = patchData.request.stock

    const result = api.patch(`/product/variant/${patchData.id}`, patchData.request)
    result.then(response => {
      const responseData: any = response.data

      if (patchData.image) {
        const formData = new FormData()
        formData.append('file', patchData.image)

        api.patchFormData(`/product/variant/${responseData.data.id}/image`, formData)
      }
    })

    return result
  },

  deleteBatchVariant(ids: number[]) {
    return api.deleteBatch(`/product/variant`, ids)
  },

  deleteImageVariant(id: number) {
    return api.delete(`/product/variant/${id}/image`)
  },

  postProductOutlet(request: ProductOutletType) {
    return api.post('/product/product-outlet-mapping/bulk', request)
  },
  deleteBatchProduct(ids: number[]) {
    return api.deleteBatch(`/product`, ids)
  },
  deleteBatchProductOutlet(ids: number[]) {
    return api.deleteBatch(`/product/product-outlet-mapping`, ids)
  },

  updateVariantImage(data: { id: number; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/product/variant/${data.id}/image`, formData)
  },

  checkProductSkuAvailable(data: { sku: string; product_id: number | null | undefined }) {
    return api.post<{ data: { is_available: boolean } }>(`/product/is-available`, data)
  },

  checkProductNameAvailable(data: { name: string; product_id: number | undefined }) {
    return api.post<{ data: { is_available: boolean } }>(`/product/is-available`, data)
  },

  exportExcelSingleVariant() {
    return api.get('/product/export-single-variant', { responseType: 'blob' }, true)
  },

  exportExcelMultipleVariant() {
    return api.get('/product/export-multiple-variant', { responseType: 'blob' }, true)
  },

  importSingleVariant(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.postFormData('/product/import-single-variant', formData, undefined, true)
  },

  importMultipleVariant(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.postFormData('/product/import-multiple-variant', formData, undefined, true)
  },

  downloadImportTemplateSingleVariant() {
    return api.get(
      '/product/download-template-import-single-variant',
      { responseType: 'blob' },
      true
    )
  },

  downloadImportTemplateMultipleVariant() {
    return api.get(
      '/product/download-template-import-multiple-variant',
      { responseType: 'blob' },
      true
    )
  }
}
