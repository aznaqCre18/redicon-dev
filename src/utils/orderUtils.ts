import { OrderItemData } from 'src/types/apps/order'
import { ListItem } from 'src/types/apps/report/product-sales'

export const getTotalPriceItem = (item: OrderItemData) => {
  return item.total - item.ppn
}

export const getTotalPriceOrder = (orderItems: OrderItemData[]) => {
  return (orderItems ?? []).reduce((acc, item) => acc + getTotalPriceItem(item), 0)
}

export const getTotalPriceItemVoid = (item: ListItem) => {
  return item.quantity * getPriceItemVoid(item)
}

export const getPriceItemVoid = (item: ListItem) => {
  return item.price - (item.ppn ?? 0) - item.discount
}

export const getTotalPriceVoid = (orderItems: ListItem[]) => {
  return orderItems.reduce((acc, item) => acc + getTotalPriceItemVoid(item), 0)
}
