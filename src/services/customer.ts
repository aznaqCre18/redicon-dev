import { MetaType } from 'src/types/pagination/meta'
import api from './core'
import {
  CustomerData,
  CustomerDetailType,
  CustomerGFPaymentDetailType,
  CustomerGFPaymentType,
  CustomerType
} from 'src/types/apps/customerType'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { parseRangeDateValue } from 'src/utils/apiUtils'
import { addDays, format } from 'date-fns'

export interface patchCostumerType {
  id: string
  request: CustomerData
}

export interface UpdateCustomer {
  id: number
  status: string
}

export const customerService = {
  getListCustomer(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CustomerType> }>('/customer', {
      params: options
    })
  },

  getListCustomerActive(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<CustomerType> }>('/customer', {
      params: { ...options, is_active: true }
    })
  },

  getListDetailCustomer(options?: PageOptionRequestType) {
    if ((options as any).query) {
      ;(options as any).query = ((options as any).query as string).replace('08', '8')
    }

    return api.get<{ meta: MetaType; data: Array<CustomerDetailType> }>('/customer/detail', {
      params: options
    })
  },

  postCustomer(request: any) {
    return api.post('/customer', request)
  },

  getCustomer(id: string) {
    return api.get<{ data: CustomerType }>(`/customer/${id}`)
  },

  deleteCustomer(id: string) {
    return api.delete(`/customer/${id}`)
  },

  deleteBatchCustomer(ids: number[]) {
    return api.deleteBatch(`/customer`, ids)
  },

  patchCustomer(patchCustomer: patchCostumerType) {
    return api.patch(`/customer/${patchCustomer.id}`, patchCustomer.request)
  },

  patchBatch(patchCustomer: UpdateCustomer[]) {
    return api.patch(`/customer`, patchCustomer)
  },

  updateImage(data: { id: number; file: File }) {
    const formData = new FormData()
    formData.append('file', data.file)

    return api.patchFormData(`/customer/${data.id}/image`, formData)
  },
  deleteImage(id: number) {
    return api.delete(`/customer/${id}/image`)
  },

  setStatus(data: { id: number; status: string }) {
    return api.patch(`/customer/${data.id}`, {
      status: data.status
    })
  },

  changePassword(data: { id: number; password: string }) {
    return api.patch(`/customer/${data.id}/password`, {
      password: data.password
    })
  },

  getReportMutationGfPayment(options?: PageOptionRequestType) {
    const parse = options ? parseRangeDateValue(options.created_at as string) : undefined
    const start_date = parse ? format(parse.startDate, 'yyyy-MM-dd') : undefined
    const end_date = parse?.endDate
      ? format(addDays(new Date(parse.endDate), 1), 'yyyy-MM-dd')
      : undefined

    return api.get<{
      meta: MetaType
      data: CustomerGFPaymentDetailType[]
    }>(`/customer/report/mutasi-gf-payment`, {
      params: {
        ...options,
        created_at: undefined,
        sort: undefined,
        order: undefined,
        start_date,
        end_date
      }
    })
  },

  getReportTopUpGfPayment(options?: PageOptionRequestType) {
    const parse = options ? parseRangeDateValue(options.created_at as string) : undefined
    const start_date = parse ? format(parse.startDate, 'yyyy-MM-dd') : undefined
    const end_date = parse?.endDate
      ? format(addDays(new Date(parse.endDate), 1), 'yyyy-MM-dd')
      : undefined

    return api.get<{
      meta: MetaType
      data: CustomerGFPaymentDetailType[]
    }>(`/customer/report/topup-gf-payment`, {
      params: {
        ...options,
        created_at: undefined,
        sort: undefined,
        order: undefined,
        start_date,
        end_date
      }
    })
  },

  getReportBalanceGfPayment(options?: PageOptionRequestType) {
    const parse = options ? parseRangeDateValue(options.created_at as string) : undefined
    const start_date = parse ? format(parse.startDate, 'yyyy-MM-dd') : undefined
    const end_date = parse?.endDate
      ? format(addDays(new Date(parse.endDate), 1), 'yyyy-MM-dd')
      : undefined

    return api.get<{
      meta: MetaType
      data: CustomerGFPaymentDetailType[]
    }>(`/customer/report/balance-gf-payment`, {
      params: {
        ...options,
        created_at: undefined,
        sort: undefined,
        order: undefined,
        start_date,
        end_date
      }
    })
  },

  mutationGfPayment(id: number) {
    return api.get<{
      meta: MetaType
      data: CustomerGFPaymentType[]
    }>(`/customer/${id}/mutasi-gf-payment`)
  },

  topUpGfPayment(request: { id: number; data: object }) {
    return api.patch(`/customer/${request.id}/topup-gf-payment`, request.data)
  },

  exportExcel() {
    return api.get('/customer/export', { responseType: 'blob' }, true)
  }
}
