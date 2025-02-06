import api from '../core'
import {
  DashboardSummary,
  DashboardSummaryChart,
  DashboardTopCategory,
  DashboardTopCustomer,
  DashboardTopProduct
} from 'src/types/apps/dashboard/dashboard'

export const dashboardService = {
  getSummary(options: object) {
    return api.get<{ data: DashboardSummary }>('/dashboard/summary', {
      params: options
    })
  },

  getChart(data: {
    start_date: string
    end_date: string
    outlet_ids?: string
    order_status?: string
  }) {
    return api.get<{ data: DashboardSummaryChart[] }>(`/dashboard/summary/chart`, {
      params: {
        start_date: data.start_date,
        end_date: data.end_date,
        outlet_ids: data.outlet_ids == '' ? undefined : data.outlet_ids,
        order_status:
          data.order_status == 'all'
            ? 'UNPAID,ON PROCESS,ON DELIVERY,COMPLETED,CANCELED'
            : data.order_status
      }
    })
  },

  getTopProducts() {
    return api.get<{ data: DashboardTopProduct[] }>('/dashboard/summary/top-products')
  },

  getTopCategories() {
    return api.get<{ data: DashboardTopCategory[] }>('/dashboard/summary/top-categories')
  },

  getTopCustomers() {
    return api.get<{ data: DashboardTopCustomer[] }>('/dashboard/summary/top-customers')
  }
}
