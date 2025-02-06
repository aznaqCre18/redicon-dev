import * as yup from 'yup'

export interface OrderPrintSettingType extends OrderPrintSettingData {
  id: number
  vendor_id: number
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export interface OrderPrintSettingData {
  show_logo: boolean
  show_outlet_name: boolean
  outlet_name: string
  show_outlet_address: boolean
  show_customer_name: boolean
  show_customer_address: boolean
  show_customer_contact: boolean
  show_unit_price: boolean
  show_msku: boolean
  show_vsku: boolean
  show_rack: boolean
  show_shipping_price: boolean
  show_shipping_type: boolean
  show_payment_method: boolean
  show_note: boolean
  note: string
  show_barcode: boolean
}

export const OrderPrintSettingSchema = yup.object<OrderPrintSettingData>().shape({
  show_logo: yup.boolean().nullable().label('Show Logo'),
  show_outlet_name: yup.boolean().nullable().label('Show Outlet Name'),
  outlet_name: yup.string().nullable().label('Outlet Name'),
  show_outlet_address: yup.boolean().nullable().label('Show Outlet Address'),
  show_customer_name: yup.boolean().nullable().label('Show Customer Name'),
  show_customer_address: yup.boolean().nullable().label('Show Customer Address'),
  show_customer_contact: yup.boolean().nullable().label('Show Customer Contact'),
  show_unit_price: yup.boolean().nullable().label('Show Unit Price'),
  show_msku: yup.boolean().nullable().label('Show MSKU'),
  show_vsku: yup.boolean().nullable().label('Show VSKU'),
  show_rack: yup.boolean().nullable().label('Show Rack'),
  show_shipping_price: yup.boolean().nullable().label('Show Shipping Price'),
  show_shipping_type: yup.boolean().nullable().label('Show Shipping Type'),
  show_payment_method: yup.boolean().nullable().label('Show Payment Method'),
  show_note: yup.boolean().nullable().label('Show Note'),
  note: yup.string().nullable().label('Note'),
  show_barcode: yup.boolean().nullable().label('Show Barcode')
})
