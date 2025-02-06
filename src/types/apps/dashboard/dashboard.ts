export interface DashboardSummary {
  total_products: number
  new_products: number
  total_orders: number
  new_orders: number
  total_customers: number
  new_customers: number
}

export interface DashboardSummaryChart {
  no?: number
  outlet_name?: string
  order_date: string
  total_sales: number
  total_grand_sales: number
  total_orders: number
  total_product_sold: number
  total_customers: number
  sales_average: number
}

export interface DashboardTopProduct {
  name: string
  quantity_sold: number
  total_sales: number
}

export interface DashboardTopCategory {
  name: string
  quantity_sold: number
  total_sales: number
}

export interface DashboardTopCustomer {
  name: string
  quantity_sold: number
  total_sales: number
}
