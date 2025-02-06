export interface ChildrenTabs {
  name: string
  caption?: string
  id?: string
  icon?: string
  link: string
  permission?: string
}

const childrenTabs: ChildrenTabs[] = [
  // Balance
  {
    name: 'Funds',
    link: '/funds'
  },
  {
    name: 'Withdraw',
    link: '/funds/withdraw'
  },
  {
    name: 'Account',
    link: '/funds/account'
  },
  // Product
  {
    name: 'Detail Order',
    link: '/order/detail/[id]',
    permission: 'order.read'
  },
  {
    name: 'Add Order',
    link: '/order/add',
    permission: 'order.create'
  },
  {
    name: 'Edit Order',
    link: '/order/edit/[id]',
    permission: 'order.update'
  },
  {
    name: 'Data Product',
    link: '/product/data',
    permission: 'product.*'
  },
  {
    name: 'Add Product',
    link: '/product/data/add',
    permission: 'product.create'
  },
  {
    name: 'Edit Product',
    link: '/product/edit/[id]',
    permission: 'product.update'
  },
  {
    name: 'Duplicate Product',
    link: '/product/data/add/[id]',
    permission: 'product.create'
  },
  {
    name: 'Category',
    link: '/product/category',
    permission: 'category.read'
  },
  {
    name: 'Brand',
    link: '/product/brand',
    permission: 'brand.read'
  },
  {
    name: 'Unit',
    link: '/product/unit',
    permission: 'unit.read'
  },
  // Stock
  {
    name: 'Data Stock',
    link: '/stock/data',
    permission: 'data stock.read'
  },
  {
    name: 'History Stock',
    link: '/stock/history',
    permission: 'history stock.read'
  },
  {
    name: 'Transfer Stock',
    link: '/stock/transfer',
    permission: 'transfer stock.read'
  },
  {
    name: 'Stock Opname',
    link: '/stock/opname',
    permission: 'stock opname.read'
  },
  {
    name: 'Add Stock Opname',
    link: '/stock/opname/add',
    permission: 'stock opname.create'
  },
  {
    name: 'Adjustment Stock',
    link: '/stock/adjustment',
    permission: 'adjustment stock.read'
  },
  {
    name: 'Add Adjustment Stock In',
    link: '/stock/adjustment/in',
    permission: 'adjustment stock.create'
  },
  {
    name: 'Add Adjustment Stock Out',
    link: '/stock/adjustment/out',
    permission: 'adjustment stock.create'
  },
  {
    name: 'Transfer Stock',
    link: '/stock/transfer',
    permission: 'transfer stock.read'
  },
  {
    name: 'Add Transfer Stock',
    link: '/stock/transfer/add',
    permission: 'transfer stock.create'
  },
  // Customer
  {
    name: 'Requestor',
    link: '/customer/data',
    permission: 'customer.read'
  },
  {
    name: 'Membership',
    link: '/customer/membership',
    permission: 'membership.read'
  },
  // Purchase
  {
    name: 'Data Purchase',
    link: '/purchase/data',
    permission: 'purchase.read'
  },
  {
    name: 'Add Purchase',
    link: '/purchase/data/add',
    permission: 'purchase.create'
  },
  {
    name: 'Edit Purchase',
    link: '/purchase/data/edit/[id]',
    permission: 'purchase.update'
  },
  {
    name: 'Add Return Purchase',
    link: '/purchase/return/add',
    permission: 'purchase return.create'
  },
  {
    name: 'Edit Return Purchase',
    link: '/purchase/return/edit/[id]',
    permission: 'purchase return.update'
  },
  {
    name: 'Return Purchase',
    link: '/purchase/return',
    permission: 'purchase return.read'
  },
  {
    name: 'Supplier',
    link: '/purchase/supplier',
    permission: 'supplier.read'
  },
  {
    name: 'Employee',
    link: '/employee'
  },
  // Invoice
  {
    name: 'Data Invoice',
    link: '/invoice/data',
    permission: 'invoice.read'
  },
  {
    name: 'Add Invoice',
    link: '/invoice/data/add',
    permission: 'invoice.create'
  },
  {
    name: 'Edit Invoice',
    link: '/invoice/data/edit/[id]',
    permission: 'invoice.update'
  },
  {
    name: 'Return Invoice',
    link: '/invoice/return',
    permission: 'invoice return.read'
  },
  {
    name: 'Add Return Invoice',
    link: '/invoice/return/add',
    permission: 'invoice return.create'
  },
  {
    name: 'Edit Return Invoice',
    link: '/invoice/return/edit/[id]',
    permission: 'invoice return.update'
  },
  {
    name: 'Debt',
    link: '/debt',
    permission: '*'
  },
  {
    name: 'Debt Repayment',
    link: '/repayment-debt'
  },
  {
    name: 'Supplier Invoice',
    link: '/invoice/supplier',
    permission: 'supplier.read'
  },
  {
    name: 'Recap',
    link: '/recap',
    permission: 'recap.read'
  },
  {
    name: 'Add Recap',
    link: '/recap/add',
    permission: 'recap.create'
  },
  {
    name: 'Edit Recap',
    link: '/recap/edit/[id]',
    permission: 'recap.update'
  },
  {
    name: 'Receivables',
    link: '/receivables'
  },
  {
    name: 'Receipt of Receivables',
    link: '/receipt-receivables'
  },

  // Marketing
  {
    name: 'Discount',
    link: '/marketing/discount'
  },
  {
    name: 'Promotion',
    link: '/marketing/promotion'
  },
  {
    name: 'Loyalty Point',
    link: '/marketing/loyalty-point'
  },

  {
    name: 'Channel Product > Shopee',
    link: '/channel-product/shopee'
  },
  {
    name: 'Channel Product > Shopee > Add Product',
    link: '/channel-product/shopee/add'
  },
  {
    name: 'Channel Product > Grab',
    link: '/channel-product/grab'
  },
  {
    name: 'Channel Product > Grab > Add Product',
    link: '/channel-product/grab/add'
  },
  {
    name: 'Add Invoice',
    link: '/invoice/data/add',
    permission: 'invoice.create'
  },
  {
    name: 'Sales Detail Report',
    link: '/reports/sales/detail',
    permission: 'reports.read'
  },
  {
    name: 'Sales Per Payment Method Report',
    link: '/reports/sales/payment-method',
    permission: 'reports.read'
  },
  {
    name: 'Sales Per Type Order Report',
    link: '/reports/sales/type-order',
    permission: 'reports.read'
  },
  {
    name: 'Void Report',
    link: '/reports/sales/void',
    permission: 'reports.read'
  },
  {
    name: 'Detail Void',
    link: '/reports/sales/void/detail/[id]',
    permission: 'reports.read'
  },
  {
    name: 'Refund Report',
    link: '/reports/sales/refund',
    permission: 'reports.read'
  },
  {
    name: 'Detail Refund',
    link: '/reports/sales/refund/detail/[id]',
    permission: 'reports.read'
  },
  {
    name: 'Commission Report',
    link: '/reports/commissions/summary',
    permission: 'reports.read'
  },
  {
    name: 'Detail Commission Report',
    link: '/reports/commissions/detail',
    permission: 'reports.read'
  },
  {
    name: 'Cashier Report',
    link: '/reports/cashiers/summary',
    permission: 'reports.read'
  },
  {
    name: 'Close Cashier Report',
    link: '/reports/cashiers/shift',
    permission: 'reports.read'
  },
  {
    name: 'Cash Cashier Report',
    link: '/reports/cashiers/cash',
    permission: 'reports.read'
  },
  {
    name: 'Tax Report',
    link: '/reports/tax',
    permission: 'reports.read'
  },
  {
    name: 'COGS Report',
    link: '/reports/cogs',
    permission: 'reports.read'
  },
  {
    name: 'Mutation Customer Report',
    link: '/reports/customer/mutation',
    permission: 'reports.read'
  },
  {
    name: 'Balance Customer Report',
    link: '/reports/customer/balance',
    permission: 'reports.read'
  },
  {
    name: 'Top up Customer Report',
    link: '/reports/customer/top-up',
    permission: 'reports.read'
  },

  // Sales Channel: Online Store, Point of Sales
  {
    name: 'Online Store',
    link: '/online-store',
    permission:
      'banner.read|shortcut.read|cms.read|features.read|login setting.read|general.read|update.read'
  },
  {
    name: 'Point of Sales',
    link: '/point-of-sales',
    permission: 'outlet.read|table management.read|shift.read|device.read|tax setting.read'
  },

  // Users
  {
    name: 'User2',
    link: '/user/data',
    permission: 'user list.read'
  },
  {
    name: 'Role',
    link: '/user/role',
    permission: 'role.read'
  },
  {
    name: 'Department',
    link: '/user/department',
    permission: 'department.read'
  },
  {
    name: 'Report Profit (Loss)',
    link: '/reports/profit-loss'
  },

  // Subscription
  {
    name: 'Add Subscription',
    link: '/account-settings/subscription/add'
  },

  // Promotion
  {
    name: 'Basic Promotion',
    link: '/marketing/promotion/basic'
  },
  {
    name: 'Product Promotion',
    link: '/marketing/promotion/product'
  },
  {
    name: 'Transaction Promotion',
    link: '/marketing/promotion/transaction'
  },
  {
    name: 'Departement',
    link: '/departement'
  },
  {
    name: 'Cost Center',
    link: '/cost-center'
  },
  {
    name: 'G/L Account',
    link: '/gl-account'
  },
  {
    name: 'Add Goods Receipt',
    link: '/goods-receipt/add'
  }
]

export default childrenTabs
