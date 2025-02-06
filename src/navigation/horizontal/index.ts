// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'
import { devMode } from 'src/configs/dev'

const navigation = (): HorizontalNavItemsType => {
  return navigationArray
}

export const navigationArray = [
  // {
  //   title: 'Dashboard',
  //   icon: 'tabler:smart-home',
  //   path: '/dashboard',
  //   permission: 'dashboard.read'
  // },
  {
    title: 'Orders',
    icon: 'tabler:brand-appgallery',
    permission: 'order.*|list order.*',
    children: [
      {
        title: 'Order List',
        path: '/list-order',
        permission: 'list order.read'
      },
      {
        title: 'Order',
        path: '/order',
        permission: 'order.read'
      }
    ]
  },
  {
    title: 'Product',
    icon: 'tabler:album',
    permission: 'product.*|stock.*',
    children: [
      {
        title: 'Product',
        path: '/product/data',
        permission: 'product.*'
      },
      {
        title: 'Data Stock',
        path: '/stock/data',
        permission: 'data stock.read|data stock.update'
      },
      {
        title: 'History Stock',
        path: '/stock/history',
        permission: 'history stock.read'
      },
      {
        title: 'Transfer Stock',
        path: '/stock/transfer',
        permission: 'transfer stock.*',
        devMode: true
      },
      {
        title: 'Stock Opname',
        path: '/stock/opname',
        permission: 'stock opname.*',
        devMode: true
      },
      {
        title: 'Adjustment Stock',
        path: '/stock/adjustment',
        permission: 'adjustment stock.*',
        devMode: true
      }
    ]
  },
  // ...(devMode
  //   ? [
  //       {
  //         title: 'Channel Product',
  //         icon: 'tabler:hierarchy',
  //         path: '/channel-product',
  //         children: [
  //           {
  //             title: 'Shopee',
  //             path: '/channel-product/shopee'
  //           }
  //         ]
  //       }
  //     ]
  //   : []),

  {
    title: 'Customer',
    icon: 'tabler:address-book',
    permission: 'customer.*|membership.*',
    children: [
      {
        title: 'Data Customer',
        path: '/customer/data',
        permission: 'customer.*'
      },
      {
        title: 'Membership',
        path: '/customer/membership',
        permission: 'membership.*'
      }
    ]
  },
  {
    title: 'Purchase',
    icon: 'tabler:truck',
    permission: 'purchase.*|purchase return.*',
    children: [
      {
        title: 'Data Purchase',
        path: '/purchase/data',
        permission: 'purchase.*'
      },
      {
        title: 'Return Purchase',
        path: '/purchase/return',
        permission: 'purchase return.*'
      },
      {
        title: 'Debt',
        path: '/debt'
      },
      {
        title: 'Debt Repayment',
        path: '/repayment-debt'
      }
    ]
  },
  {
    title: 'Invoice',
    icon: 'tabler:file-dollar',
    permission: 'invoice.*|invoice return.*|recap.*',
    children: [
      {
        title: 'Data Invoice',
        path: '/invoice/data',
        permission: 'invoice.*'
      },
      {
        title: 'Return Invoice',
        path: '/invoice/return',
        permission: 'invoice return.*'
      },
      {
        title: 'Recap',
        path: '/recap',
        permission: devMode ? 'recap.*' : 'vendor-18'
      },
      {
        title: 'Receivables',
        path: '/receivables'
      },
      {
        title: 'Receipt of Receivables',
        path: '/receipt-receivables'
      }
    ]
  },

  // ...(devMode
  //   ? [
  //       {
  //         title: 'Marketing',
  //         icon: 'iconamoon:discount',
  //         devMode: true,
  //         children: [
  //           {
  //             title: 'Discount',
  //             path: '/marketing/discount'
  //           },
  //           {
  //             title: 'Promotion',
  //             path: '/marketing/promotion'
  //           },
  //           {
  //             title: 'Loyalty Point',
  //             path: '/marketing/loyalty-point'
  //           }
  //         ]
  //       }
  //     ]
  //   : []),
  {
    title: 'Reports',
    icon: 'tabler:file-analytics',
    expanded: true,
    permission: 'report.*',
    children: [
      {
        title: 'Sales',
        icon: 'tabler:file-analytics',
        children: [
          {
            title: 'Summary',
            path: '/reports/summary',
            devMode: true
          },
          {
            title: 'Sales',
            path: '/reports/sales/sales'
          },
          {
            title: 'Detail Sales',
            path: '/reports/sales/detail'
          },
          {
            title: 'Return Sales',
            path: '/reports/sales/return'
          },
          {
            title: 'Payment Method2',
            path: '/reports/sales/payment-method'
          },
          {
            title: 'Type Order',
            path: '/reports/sales/type-order'
          },
          {
            title: 'Void',
            path: '/reports/sales/void'
          },
          {
            title: 'Refund',
            path: '/reports/sales/refund',
            devMode: true
          }
        ]
      },
      {
        title: 'Stock2',
        icon: 'tabler:file-analytics',
        children: [
          // Remaining Stock, Stock Value, Mutation Stock, Mutation Stock Per Variant, Analysis Stock
          {
            title: 'Remaining Stock',
            path: '/reports/stocks/remaining'
          },
          {
            title: 'Stock Value',
            path: '/reports/stocks/value'
          },
          {
            title: 'Mutation Stock',
            path: '/reports/stocks/mutation'
          },
          {
            title: 'Analysis Stock',
            path: '/reports/stocks/analysis'
          }
        ]
      },
      {
        title: 'Tax',
        icon: 'tabler:file-analytics',
        path: '/reports/tax'
      },
      {
        title: 'COGS / HPP',
        icon: 'tabler:file-analytics',
        path: '/reports/cogs'
      },
      {
        title: 'Commission',
        icon: 'tabler:file-analytics',
        path: '/reports/commissions',
        children: [
          {
            title: 'Summary',
            path: '/reports/commissions/summary'
          },
          {
            title: 'Detail Commission',
            path: '/reports/commissions/detail'
          }
        ]
      },
      {
        title: 'Promotion',
        icon: 'tabler:file-analytics',
        path: '/reports/promotions',
        devMode: true
      },
      {
        title: 'Cashier',
        icon: 'tabler:file-analytics',
        // devMode: true,
        children: [
          {
            title: 'Summary',
            path: '/reports/cashiers/summary'
          },
          {
            title: 'Shift Cashier',
            path: '/reports/cashiers/shift'
          },
          {
            title: 'Cash Cashier',
            path: '/reports/cashiers/cash'
          },
          {
            title: 'Close Cashier',
            path: '/reports/cashiers/close'
          }
        ]
      },
      {
        title: 'Customer',
        icon: 'tabler:file-analytics',
        permission: 'vendor-69',
        children: [
          {
            title: 'Mutation',
            path: '/reports/customer/mutation'
          },
          {
            title: 'Balance',
            path: '/reports/customer/balance'
          },
          {
            title: 'Top Up',
            path: '/reports/customer/top-up'
          }
        ]
      },
      {
        title: 'Profit (Loss)',
        icon: 'tabler:file-analytics',
        path: '/reports/profit-loss'
      }
    ]
  },
  // {
  //   title: '3rd Party Add On',
  //   icon: 'tabler:apps',
  //   path: '/add-ons'
  // },
  // ...(devMode
  //   ? [
  //       {
  //         title: 'Integration',
  //         icon: 'tabler:replace',
  //         path: '/integration'
  //       }
  //     ]
  //   : []),
  {
    title: 'Master Data',
    icon: 'tabler:database',
    permission: 'category.*|brand.*|unit.*|supplier.*|user list.*|role.*|department.*',
    children: [
      {
        title: 'Category',
        path: '/product/category',
        permission: 'category.*'
      },
      {
        title: 'Brand',
        path: '/product/brand',
        permission: 'brand.*'
      },
      {
        title: 'Unit',
        path: '/product/unit',
        permission: 'unit.*'
      },
      {
        title: 'Supplier',
        path: '/purchase/supplier',
        permission: 'supplier.*'
      },
      {
        title: 'Employee',
        path: '/employee'
      },
      {
        title: 'User2',
        path: '/user/data',
        permission: 'user list.*'
      },
      {
        title: 'Role',
        path: '/user/role',
        permission: 'role.*'
      },
      {
        title: 'Department',
        path: '/user/department',
        permission: 'department.*'
      },
      {
        title: 'Departement',
        path: '/departement'
      },
      {
        title: 'Cost Center',
        path: '/cost-center'
      }
    ]
  },
  {
    title: 'Settings',
    icon: 'tabler:settings',
    path: '/settings/system',
    permission:
      'setting - product.read|setting - order.read|setting - shipping.read|setting - payment.read',
    children: [
      {
        title: 'Online Store',
        path: '/online-store',
        permission:
          'banner.read|shortcut.read|cms.read|features.read|login setting.read|general.read|update.read'
      },
      {
        title: 'Point of Sales',
        path: '/point-of-sales',
        permission: 'outlet.read|table management.read|shift.read|device.read|tax setting.read'
      },
      {
        title: 'Product',
        path: '/settings/system/product-setting',
        permission: 'setting - product.read'
      },
      {
        title: 'Orders',
        path: '/settings/system/orders-setting',
        permission: 'setting - order.read'
      },
      {
        title: 'Shipping',
        path: '/settings/system/shipping-setting',
        permission: 'setting - shipping.read'
      },
      {
        title: 'Payment',
        path: '/settings/system/payment-setting',
        permission: 'setting - payment.read'
      }
    ]
  },
  {
    title: 'Other',
    icon: 'fluent:money-hand-20-regular',
    children: [
      {
        title: 'Commission',
        icon: 'fluent:money-hand-20-regular',
        path: '/commission',
        permission: 'commission.*'
      },
      {
        title: 'Expense',
        icon: 'tabler:cash-banknote',
        path: '/expense',
        permission: 'cost.*'
      }
    ]
  }
]

export default navigation
