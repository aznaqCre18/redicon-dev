import { addHours } from 'date-fns'
import { CustomerAddressDetailType, CustomerAddressType } from './customerAddressType'
import { CustomerType } from './customerType'
import { ProductType, VariantType } from './productType'
import { BankVendorType } from './vendor/BankVendorType'
import { CodSettingType } from './vendor/settings/shipping'
import * as yup from 'yup'
import { RajaOngkirData } from './rajaOngkir'
import { OutletType } from './outlet/outlet'
import { EmployeeType } from './employee'

export type OrderStatusType =
  | 'UNPAID'
  | 'PAYMENT_DENIED'
  | 'ON PROCESS'
  | 'ON VALIDATION'
  | 'CANCELED'
  | 'COMPLETED'
  | 'ON DELIVERY'
  | 'WAITING VALIDATION'
  | 'TROLLEY'
  | 'RECAP'
  | 'SCAN'
  | 'APPROVED'
  | 'ACKNOWLEDGMENT'
  | 'PRE DELIVERY'
  | ''

export const OrderStatusTab = [
  // '',
  // 'TROLLEY',
  // 'UNPAID',
  // 'WAITING VALIDATION'
  // 'PAYMENT_DENIED',
  'APPROVED',
  'ACKNOWLEDGMENT',
  'ON PROCESS',
  'PRE DELIVERY',
  'ON DELIVERY',
  // 'ON VALIDATION',
  'COMPLETED',
  'CANCELED',
  'RECAP'
  // 'SCAN'
]

export type OrderData = {
  vendor_id: number
  customer_id: number
  order_number: string
  order_placed_from: string
  customer_address_id: number
  payment_method: string
  payment_method_id: number | null
  payment_status: string
  total: number
  tax: number
  ppn: number
  service_charges_mdr: number
  shipping_cost: number
  discount: number
  grand_total: number
  shipping_type: string | null
  shipping: {
    estimation: string
    logo: string
    name: string
    price: number
    service: string
  }
  shipping_tax: number | null
  order_status: string
  item_qty: number
  product_qty: number
  is_print: boolean
  is_collect: boolean
  weight: number
  status: string
}

export interface OrderDetailType extends OrderData {
  id: number
  outlet_name: string
  outlet_id: number
  global_discount: number
  global_discount_recap: number
  discount_membership: number
  customer: CustomerType
  outlet?: OutletType
  customer_address: CustomerAddressType
  customer_addresses_detail: CustomerAddressDetailType | null
  cod_payment: CodSettingType | null
  payment_method_detail: BankVendorType | null
  has_wholesale_price: boolean
  ppn_percentage: number
  expired_at: string
  created_at: string
  created_by_name: string
  division_name: string
  order_type: string
  updated_at: string
}

export type OrderItemData = {
  order_id: number
  product_id: number
  product_variant_id: number | null
  name: string
  note: ''
  quantity: number
  price: number
  discount: number
  discount_per_item: number
  total: number
  ppn: number
  fix_tax: number
  fix_tax_per_item: number
}

export interface OrderItemDetailType extends OrderItemData {
  id: number
  discount_membership: number
  product: ProductType
  product_variant: VariantType
  is_wholesale_price: boolean
  created_at: string
  updated_at: string
}

export interface OrderFullDetailType {
  order: OrderDetailType
  order_items: OrderItemDetailType[]
  order_payments: OrderPayment[]
  employees: EmployeeType[] | null
  employee: EmployeeType | null
}

export interface OrderStatusCount {
  [key: string]: number
  CANCELED: number
  TROLLEY: number
  COMPLETED: number
  'ON DELIVERY': number
  'ON PROCESS': number
  'ON VALIDATION': number
  PAYMENT_DENIED: number
  TOTAL: number
  UNPAID: number
  'WAITING VALIDATION': number
}

type CartType = {
  id: number
  vendor_id: number
  customer_id: number
  item_quantity: number
  checked_out_item_quantity: number
  total: number
  tax: number
  shipping_cost: number
  discount: number
  grand_total: number
  created_at: string
  updated_at: string
}

type CartItemType = {
  id: number
  cart_id: number
  product_id: number
  product_variant_id: number | null
  quantity: number
  name: string
  price: number
  tax: number
  discount: number
  note: string
  checked_out: boolean
  expired_at: string | null
  created_at: string
  updated_at: string
}

export interface TrolleyType {
  cart: CartType
  cart_items: {
    cart_item: CartItemType
    product: ProductType
    product_variant: VariantType | null
  }[]
  customer: CustomerType
}

export interface TrolleyDetailType {
  cart_item: CartItemType
  product: ProductType
  product_variant: VariantType | null
  customer: CustomerType
  cart: CartType
}

export const convertTrolleyTypeToOrderType = (trolley: TrolleyType[]): any => {
  return trolley.map(t => {
    return {
      order: {
        id: t.cart.id,
        vendor_id: t.cart.vendor_id,
        customer_id: t.cart.customer_id,
        customer: t.customer,
        order_number: t.cart.id,
        order_placed_from: 'APP',
        customer_address_id: 0,
        payment_method: '',
        payment_method_id: null,
        payment_status: '',
        total: t.cart.total,
        tax: t.cart.tax,
        shipping_cost: t.cart.shipping_cost,
        discount: t.cart.discount,
        grand_total: t.cart.grand_total,
        shipping_type: null,
        shipping: {
          estimation: '',
          logo: '',
          name: '',
          price: 0,
          service: ''
        },
        shipping_tax: null,
        order_status: 'TROLLEY',
        item_qty: t.cart.item_quantity,
        product_qty: t.cart_items.length,
        created_at:
          t.cart_items.length > 0 ? t.cart_items[0].cart_item.created_at : t.cart.created_at,
        updated_at: t.cart.updated_at,
        expired_at: t.cart_items.length > 0 ? t.cart_items[0].cart_item.expired_at : null
      },
      order_items: t.cart_items.map(ci => {
        return {
          id: ci.cart_item.id,
          product: ci.product,
          product_variant: ci.product_variant,
          order_id: 0,
          product_id: ci.product.id,
          product_variant_id: ci.product_variant ? ci.product_variant.id : null,
          name: ci.product.name,
          note: ci.cart_item.note,
          quantity: ci.cart_item.quantity,
          price: ci.cart_item.price,
          discount: ci.cart_item.discount,
          discount_per_item: ci.cart_item.discount,
          total: ci.cart_item.price * ci.cart_item.quantity - ci.cart_item.discount,
          fix_tax: ci.cart_item.tax,
          fix_tax_per_item: ci.cart_item.tax
        }
      })
    }
  })
}

export const convertTrolleyDetailTypeToOrderType = (trolley: TrolleyDetailType[]): any => {
  return trolley.map(t => {
    return {
      order: {
        id: t.cart_item.id,
        vendor_id: t.customer.vendor_id,
        customer_id: t.customer.id,
        customer: t.customer,
        order_number: t.cart_item.id,
        order_placed_from: 'APP',
        customer_address_id: 0,
        payment_method: '',
        payment_method_id: null,
        payment_status: '',
        total: t.cart_item.price * t.cart_item.quantity,
        tax: 0,
        shipping_cost: 0,
        discount: 0,
        grand_total: t.cart_item.price * t.cart_item.quantity,
        shipping_type: null,
        shipping: {
          estimation: '',
          logo: '',
          name: '',
          price: 0,
          service: ''
        },
        shipping_tax: null,
        order_status: 'TROLLEY',
        item_qty: 1,
        product_qty: 1,
        created_at: t.cart_item.created_at,
        updated_at: t.cart_item.updated_at,
        expired_at: t.cart_item.expired_at
      },
      order_items: [
        {
          id: t.cart_item.id,
          product: t.product,
          product_variant: t.product_variant,
          order_id: 0,
          product_id: t.product.id,
          product_variant_id: t.product_variant ? t.product_variant.id : null,
          name: t.product.name,
          note: t.cart_item.note,
          quantity: t.cart_item.quantity,
          price: t.cart_item.price,
          discount: 0,
          discount_per_item: 0,
          total: t.cart_item.price,
          fix_tax: 0,
          fix_tax_per_item: 0
        }
      ]
    }
  })
}

export interface UpdateOrderScan {
  order_id: number
  payment_method?: string
  payment_method_id?: number | undefined
  order_status: 'COMPLETED'
}

export interface OrderDetailV2 {
  order: OrderV2
  order_items: OrderItemV2[]
  order_payments: OrderPaymentV2[]
  [key: string]: any
}

export interface OrderV2 {
  id: number
  order_number: string
  order_status: string
  outlet_name: string
  grand_total: number
  global_discount: number
  global_discount_recap: number
  item_qty: number
  payment_method: string
  is_print: boolean
  is_collect: boolean
  created_at: Date
  expired_at: Date
  customer_id: number
  customer_name: string
  customer_profile_picture: string
  shipping_name: string
  shipping_logo: string
  shipping_cost: number
  shipping_tax: number
  tax: number
  service_charges_mdr: number
  cod_payment_name: string
  cod_payment_logo: string
}

export interface OrderItemV2 {
  id: number
  order_id: number
  name: string
  note: string
  discount: number
  discount_membership: number
  discount_per_item: number
  fix_tax: number
  price: number
  quantity: number
  fix_tax_per_item: number
  total: number
  product_name: string
  product_media: string[]
  product_sku: string
  product_variant_sku: string
  product_variant_attributes: ProductVariantAttribute[]
  product_rack_position: string
  is_wholesale_price: boolean
}

export interface ProductVariantAttribute {
  name: string
  value: string
}

export interface OrderPaymentV2 {
  id: number
  order_id: number
  payment_method: string
  payment_status: string
  payment_method_detail?: any
}

export interface PaymentMethodDetailV2 {
  account_name: string
  account_number: string
  bank_image: string
  bank_name: string
  created_at: Date
  created_by: number
  id: number
  is_active: string
  outlet_id: number
  updated_at: Date
  updated_by: number | null
  vendor_id: number
}

export const priceTotalOrderItemV2 = (orderItem: OrderItemV2) => {
  return (orderItem.price - orderItem.discount + orderItem.fix_tax_per_item) * orderItem.quantity
}

export const convertTrolleyDetailTypeToOrderTypeV2 = (
  trolley: TrolleyDetailType[]
): OrderDetailV2[] => {
  return trolley.map(t => ({
    order: {
      id: t.cart_item.id,
      order_number: t.cart_item.id.toString(),
      order_status: 'TROLLEY',
      outlet_name: '',
      grand_total: t.cart_item.price * t.cart_item.quantity,
      global_discount: 0,
      global_discount_recap: 0,
      item_qty: 1,
      payment_method: '',
      is_print: false,
      is_collect: false,
      created_at: addHours(new Date(t.cart_item.created_at), -7),
      expired_at: t.cart_item.expired_at ? new Date(t.cart_item.expired_at) : new Date(),
      customer_id: Number(t.customer.id),
      customer_name: t.customer.name,
      customer_profile_picture: t.customer.profile_picture,
      shipping_name: '',
      shipping_logo: '',
      shipping_cost: 0,
      shipping_tax: 0,
      tax: 0,
      service_charges_mdr: 0,
      cod_payment_name: '',
      cod_payment_logo: ''
    },
    order_items: [
      {
        id: t.cart_item.id,
        order_id: t.cart_item.id,
        name: t.product.name,
        note: t.cart_item.note,
        discount: 0,
        discount_per_item: 0,
        discount_membership: 0,
        fix_tax: t.cart_item.tax,
        price: t.cart_item.price,
        quantity: t.cart_item.quantity,
        fix_tax_per_item: t.cart_item.tax,
        total: t.cart_item.price * t.cart_item.quantity,
        product_name: t.product.name,
        product_media: t.product.media ?? [],
        product_sku: t.product.sku,
        product_variant_sku: t.product_variant ? t.product_variant.sku : '',
        product_variant_attributes: t.product_variant
          ? t.product_variant.attributes.map(
              (attr): ProductVariantAttribute => ({
                name: attr.name,
                value: attr.value
              })
            )
          : [],
        product_rack_position: t.product.rack_position,
        is_wholesale_price: false
      }
    ],
    order_payments: [
      {
        id: 0,
        order_id: t.cart_item.id,
        payment_method: '',
        payment_status: '',
        payment_method_detail: null
      }
    ] as any
  }))
}

export const orderStatusArray = [
  'UNPAID',
  // 'PAYMENT_DENIED',
  'ON PROCESS',
  // 'ON VALIDATION',
  'CANCELED',
  'COMPLETED'
  // 'ON DELIVERY'
  // 'WAITING VALIDATION',
  // 'TROLLEY',
  // 'RECAP',
  // 'SCAN'
]

export const orderPaymentStatusArray = [
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
  'unpaid'
]

export const orderPaymentMethodArray = [
  'CASH',
  // 'CREDIT CARD',
  'DEBIT CARD',
  'BANK TRANSFER',
  // 'VIRTUAL ACCOUNT',
  'EWALLET'
]

export const orderShippingTypeArray = ['COURIER MANUAL', 'COURIER RAJA ONGKIR', 'SELFPICKUP']

export type OrderItem = {
  price: number
  product_id: number
  product_variant_id: number | null
  discount_per_item: number
  quantity: number
}

export interface OrderPayment {
  payment_method: string
  payment_method_id: number | null
  ref_no: string
  trace_no: string
  payment_method_detail?: any
}

export type OrderEditData = {
  order_date: Date
  outlet_id: number
  order_status: string
  order_type: string
  order_number: string
  payment_status: string
  payment_method: string
  payment_method_id: number | null
  shipping_type: string | null
  shipping_detail: RajaOngkirData | null
  customer_id: number
  customer_address_id: number | null
  sub_total: number
  global_discount: number | null
  shipping_cost: number
  shipping_tax: number | null
  order_items: OrderItem[]
  cod_payment_name: string | null
  cod_payment_logo: string | null
  order_payments: OrderPayment[]
}

export const orderSchema = yup.object<OrderEditData>().shape({
  order_date: yup.date().required().label('Date'),
  outlet_id: yup.number().required().label('Outlet'),
  order_status: yup.string().oneOf(orderStatusArray).required().label('Order Status'),
  order_type: yup.string().required().label('Order Type'),
  order_number: yup.string().nullable().label('Order Number'),
  payment_status: yup.string().oneOf(orderPaymentStatusArray).required().label('Payment Status'),
  payment_method: yup.string().oneOf(orderPaymentMethodArray).required().label('Payment Method'),
  payment_method_id: yup.number().nullable().label('Payment Method'),
  cod_payment_name: yup.string().nullable().label('COD Payment Name'),
  cod_payment_logo: yup.string().nullable().label('COD Payment Logo'),
  shipping_type: yup.string().oneOf(orderShippingTypeArray).nullable().label('Shipping Type'),
  shipping_detail: yup
    .object()
    .shape({
      estimation: yup.string().nullable().label('Estimation'),
      logo: yup.string().nullable().label('Logo'),
      name: yup.string().nullable().label('Name'),
      price: yup.number().nullable().label('Price'),
      service: yup.string().nullable().label('Service')
    })
    .nullable(),
  customer_id: yup.number().required().label('Customer'),
  customer_address_id: yup.number().nullable().label('Customer Address'),
  sub_total: yup.number().required().label('Sub Total'),
  global_discount: yup.number().nullable(),
  shipping_cost: yup.number().required().label('Shipping Cost'),
  shipping_tax: yup.number().nullable(),
  order_items: yup
    .array(
      yup.object<OrderItem>().shape({
        price: yup.number().required().label('Price'),
        product_id: yup.number().required().label('Product ID'),
        product_variant_id: yup.number().nullable().label('Product Variant ID'),
        discount_per_item: yup.number().required().label('Discount Per Item'),
        quantity: yup.number().required().label('Quantity')
      })
    )
    .min(1)
    .label('Order Item'),
  order_payments: yup.array(
    yup.object<OrderPayment>().shape({
      payment_method: yup.string().required().label('Payment Method'),
      payment_method_id: yup.number().nullable().label('Payment Method ID'),
      ref_no: yup.string().label('Ref No').nullable(),
      trace_no: yup.string().label('Trace No').nullable()
    })
  )
})

export interface DeliveryOrders {
  date: string | null
  remainingOrder: number
  order: number
}

export const DeliveryOrdersSchema = yup.object<{ deliveryOrders: DeliveryOrders[] }>().shape({
  deliveryOrders: yup
    .array(
      yup.object<DeliveryOrders>().shape({
        date: yup.string().required().label('Date'),
        remainingOrder: yup.number().required().label('Remaining Order'),
        order: yup.number().required().label('Order')
      })
    )
    .min(1, 'At least one delivery order is required')
})

export type DeliveryOrdersType = yup.InferType<typeof DeliveryOrdersSchema>
