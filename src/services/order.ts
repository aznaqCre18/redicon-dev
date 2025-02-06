import api from './core'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import {
  OrderFullDetailType,
  OrderStatusCount,
  OrderDetailV2,
  TrolleyDetailType,
  TrolleyType,
  UpdateOrderScan,
  OrderEditData
} from 'src/types/apps/order'

export const orderService = {
  getList(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<OrderFullDetailType> }>('/order', {
      params: options
    })
  },

  getListV2(options?: PageOptionRequestType) {
    const { created_at, ...rest } = options || ({} as any)

    const explode = created_at ? created_at.split('~') : []
    const start_date = explode[0]
    const end_date = explode[1]
    const newOptions = { ...rest, start_date, end_date }

    if (rest.order_status === 'SCAN' || rest.order_status === '') return

    return api.get<{ meta: MetaType; data: Array<OrderDetailV2> }>(
      '/order/v2',
      {
        params: {
          ...rest,
          ...newOptions,
          ...{
            order: 'date',
            sort: 'desc'
          }
        }
      },
      true
    )
  },

  getListTrolley(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<TrolleyType> }>('/customer/carts', {
      params: options
    })
  },

  getListTrolleyDetail(options?: PageOptionRequestType) {
    return api.get<{ meta: MetaType; data: Array<TrolleyDetailType> }>('/customer/carts/detail', {
      params: options
    })
  },

  getOne(id: string) {
    return api.get<{ data: OrderFullDetailType }>(`/order/${id}/detail`)
  },

  findByOrderNumber(orderNumber: string) {
    return api.get<{ data: OrderFullDetailType[] }>(`/order`, {
      params: {
        order_number: orderNumber
      }
    })
  },

  getStatusCount(options?: any) {
    return api.get<{ data: OrderStatusCount }>('/order/status-count', {
      params: options
    })
  },

  updateStatus(data: { id: number; order_status: 'CANCELED' | 'ON PROCESS' | 'COMPLETED' }) {
    return api.patch(`/order/${data.id}`, { order_status: data.order_status })
  },

  updatePrint(data: { id: number; is_print?: boolean; is_collect?: boolean }) {
    return api.patch(`/order/` + data.id, {
      is_print: data.is_print ?? undefined,
      is_collect: data.is_collect ?? undefined
    })
  },

  updateBatchOrderScan(data: UpdateOrderScan[]) {
    return api.patch(`/order`, data)
  },

  create(data: OrderEditData) {
    return api.post(`/dashboard/order`, data)
  },

  update(data: { id: number; data: OrderEditData }) {
    return api.patch(`/dashboard/order/${data.id}`, data.data, undefined, true)
  },

  cancelBatchTrolley(ids: number[]) {
    return api.deleteBatch(`/customer/trolley/cart-item`, ids)
  }

  // post(request: any) {
  //   return api.post('/order', request)
  // },

  // patch(data: BrandType) {
  //   return api.patch(`/order/${data.id}`, data)
  // },

  // delete(id: string) {
  //   return api.delete(`/order/${id}`)
  // },

  // deleteBatch(ids: number[]) {
  //   return api.deleteBatch(`/order`, ids)
  // }
}
