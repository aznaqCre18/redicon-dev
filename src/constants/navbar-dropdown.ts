export type NavbarDropdownType = {
  name: string
  link: string
  devMode?: boolean
  children?: NavbarDropdownType[]
  permission?: string
}

export const navbarDropdowns: NavbarDropdownType[] = [
  {
    name: 'Sales',
    link: '/reports/sales/sales',
    permission: 'reports.read',
    children: [
      { name: 'Sales Per Day Report', link: '/reports/sales/sales/day' },
      { name: 'Sales per Period Report', link: '/reports/sales/sales/period' },
      { name: 'Sales Per Customer Report', link: '/reports/sales/sales/customer' },
      { name: 'Sales Per User Report', link: '/reports/sales/sales/user' },
      { name: 'Sales Per Product Report', link: '/reports/sales/sales/product' },
      { name: 'Sales Per Category Report', link: '/reports/sales/sales/category' },
      { name: 'Sales Per Brand Report', link: '/reports/sales/sales/brand' },
      { name: 'Sales Per Outlet Report', link: '/reports/sales/sales/outlet' },
      { name: 'Sales Per Terminal Report', link: '/reports/sales/sales/terminal' }
    ]
  },
  {
    name: 'Return Sales',
    link: '/reports/sales/return',
    permission: 'reports.read',
    children: [
      { name: 'Return Sales Report', link: '/reports/sales/return/day' },
      { name: 'Return Sales Per Customer Report', link: '/reports/sales/return/customer' }
    ]
  },
  {
    name: 'Remaining Stock',
    link: '/reports/stocks/remaining',
    permission: 'reports.read',
    children: [
      { name: 'Remaining Stock Report', link: '/reports/stocks/remaining/product' },
      {
        name: 'Remaining Stock Per Variant Report',
        link: '/reports/stocks/remaining/variant-product'
      }
    ]
  },
  {
    name: 'Stock Value',
    link: '/reports/stocks/value',
    permission: 'reports.read',
    children: [
      { name: 'Stock Value Report', link: '/reports/stocks/value/product' },
      { name: 'Stock Value Per Variant Report', link: '/reports/stocks/value/variant-product' }
    ]
  },
  {
    name: 'Mutation Stock',
    link: '/reports/stocks/mutation',
    permission: 'reports.read',
    children: [
      { name: 'Mutation Stock Report', link: '/reports/stocks/mutation/product' },
      {
        name: 'Mutation Stock Per Variant Report',
        link: '/reports/stocks/mutation/variant-product'
      }
    ]
  },
  {
    name: 'Analysis Stock',
    link: '/reports/stocks/analysis',
    permission: 'reports.read',
    children: [
      // Product Best Seller, Product Best Seller Variant, Product Unsold, Product Unsold Variant
      { name: 'Best Seller Product Report', link: '/reports/stocks/analysis/best-seller-product' },
      {
        name: 'Best Seller Product Per Variant Report',
        link: '/reports/stocks/analysis/best-seller-variant-product'
      },
      { name: 'Unsold Product Report', link: '/reports/stocks/analysis/un-sold-product' },
      {
        name: 'Unsold Product Per Variant Report',
        link: '/reports/stocks/analysis/un-sold-variant-product'
      }
    ]
  },
  {
    name: 'Cash Cashier',
    link: '/reports/cashiers/cash',
    permission: 'reports.read',
    children: [
      { name: 'Cash Cashier Report', link: '/reports/cashiers/cash/summary' },
      { name: 'Cash Cashier Detail Report', link: '/reports/cashiers/cash/detail' }
    ]
  },
  {
    name: 'Close Shift',
    link: '/reports/cashiers/close',
    permission: 'reports.read',
    children: [
      { name: 'Summary Close Cashier Report', link: '/reports/cashiers/close/summary' },
      { name: 'Total Product Cashier Report', link: '/reports/cashiers/close/product' }
    ]
  }
]
