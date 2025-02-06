import { ChildrenTabs } from './children-tabs'

const systemSettingList: ChildrenTabs[] = [
  {
    name: 'Product Setting',
    caption: 'Product Setting',
    id: 'product-setting',
    link: '/settings/system/product-setting',
    icon: 'octicon:gear-24',
    permission: 'setting - product.read'
  },
  {
    name: 'Orders Setting',
    caption: 'Orders',
    id: 'orders-setting',
    link: '/settings/system/orders-setting',
    icon: 'tabler:basket-cog',
    permission: 'setting - order.read'
  },
  // {
  //   name: 'Stock Setting',
  //   caption: 'Stock Setting',
  //   id: 'stock-setting',
  //   link: '/settings/system/stock-setting',
  //   icon: 'octicon:gear-24'
  // },
  // {
  //   name: 'Customer Setting',
  //   caption: 'Customer Setting',
  //   id: 'customer-setting',
  //   link: '/settings/system/customer-setting',
  //   icon: 'octicon:gear-24',
  //   permission: 'customers.membership'
  // },
  // {
  //   name: 'Purchase Setting',
  //   caption: 'Purchase Setting',
  //   id: 'purchase-setting',
  //   link: '/settings/system/purchase-setting',
  //   icon: 'octicon:gear-24'
  // },
  // {
  //   name: 'Sales Setting',
  //   caption: 'Sales Setting',
  //   id: 'sales-setting',
  //   link: '/settings/system/sales-setting',
  //   icon: 'tabler:file-settings'
  // },
  {
    name: 'Shipping Setting',
    caption: 'Shipping',
    id: 'shipping-setting',
    link: '/settings/system/shipping-setting',
    icon: 'tabler:plane',
    permission: 'setting - shipping.read'
  },
  {
    name: 'Payment Setting',
    caption: 'Payment',
    id: 'payment-setting',
    link: '/settings/system/payment-setting',
    icon: 'tabler:credit-card',
    permission: 'setting - payment.read'
  }
  // {
  //   name: 'Store Setting',
  //   caption: 'Store Setting',
  //   id: 'store-setting',
  //   link: '/settings/system/store-setting',
  //   icon: 'tabler:building-store'
  // }
]

export default systemSettingList
