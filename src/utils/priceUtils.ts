import { OrderItemData } from 'src/types/apps/order'

export const getOrderItemPrice = (orderItem: OrderItemData) => orderItem.price

export const getOrderItemDiscount = (orderItem: OrderItemData) =>
  orderItem.discount / orderItem.quantity

export const getOrderItemFixTax = (orderItem: OrderItemData) =>
  orderItem.fix_tax / orderItem.quantity

export const getOrderItemTotalPrice = (orderItem: OrderItemData) =>
  getOrderItemPrice(orderItem) + getOrderItemFixTax(orderItem) - getOrderItemDiscount(orderItem)

export const getOrderItemSubTotal = (orderItem: OrderItemData) =>
  getOrderItemTotalPrice(orderItem) * orderItem.quantity
