import * as yup from 'yup'

export interface ReceiptSettingData {
  vendor_id: number
  outlet_id: number
  destination_name: string
  is_separate_print: number
  is_show_logo: number
  is_show_receipt_code: number
  is_show_receipt_number: number
  is_show_queue_number: number
  is_show_unit: number
  is_show_customer_address: number
  is_show_total_quantity: number
  is_show_price_type: number
  is_show_form_feedback: number
  feedback_form_type: string
  header: string
  footer: string
  feedback_url: string
  receipt_number: string
  is_show_brand_name: number
  is_show_outlet_name: number
  is_show_outlet_address: number
  is_show_outlet_email: number
  is_show_outlet_phone: number
  is_show_customer_name: number
  is_show_customer_points: number
  is_show_product_prices: number
  is_show_subtotal: number
  is_show_tax: number
  is_show_service_charge: number
  is_show_total_discount: number
  is_show_rounding: number
  is_show_total: number
  is_show_paid: number
  is_show_change: number
  is_show_insta_pos_logo: number
  bottom_margin: number
  receipt_number_format: number
  online_receipt_text: string
  notes: string
  is_show_table_name: boolean
  is_show_employee_name: boolean
  is_show_order_type: boolean
  is_show_merchant_name: boolean
  is_show_order_date: boolean
  is_show_cashier_name: boolean
}

export interface ReceiptSettingType extends ReceiptSettingData {
  id: number
  is_default: boolean
  sort_position: boolean
  created_at: Date
  updated_at: Date
}

export const ReceiptSchema = yup.object<ReceiptSettingData>().shape({
  destination_name: yup.string().required().label('Destination Name'),
  is_separate_print: yup.number().required().label('Is Separate Print'),
  is_show_logo: yup.number().required().label('Is Show Logo'),
  is_show_receipt_code: yup.number().required().label('Is Show Receipt Code'),
  is_show_receipt_number: yup.number().required().label('Is Show Receipt Number'),
  is_show_queue_number: yup.number().required().label('Is Show Queue Number'),
  is_show_unit: yup.number().required().label('Is Show Unit'),
  is_show_customer_address: yup.number().required().label('Is Show Customer Address'),
  is_show_total_quantity: yup.number().required().label('Is Show Total Quantity'),
  is_show_price_type: yup.number().required().label('Is Show Price Type'),
  is_show_form_feedback: yup.number().required().label('Is Show Form Feedback'),
  feedback_form_type: yup.string().required().label('Feedback Form Type'),
  header: yup.string().label('Header'),
  footer: yup.string().label('Footer'),
  feedback_url: yup.string().label('Feedback Url'),
  receipt_number: yup.string().label('Receipt Number'),
  is_show_brand_name: yup.number().required().label('Is Show Brand Name'),
  is_show_outlet_name: yup.number().required().label('Is Show Outlet Name'),
  is_show_outlet_address: yup.number().required().label('Is Show Outlet Address'),
  is_show_outlet_email: yup.number().required().label('Is Show Outlet Email'),
  is_show_outlet_phone: yup.number().required().label('Is Show Outlet Phone'),
  is_show_customer_name: yup.number().required().label('Is Show Customer Name'),
  is_show_customer_points: yup.number().required().label('Is Show Customer Points'),
  is_show_product_prices: yup.number().required().label('Is Show Product Prices'),
  is_show_subtotal: yup.number().required().label('Is Show Subtotal'),
  is_show_tax: yup.number().required().label('Is Show Tax'),
  is_show_service_charge: yup.number().required().label('Is Show Service Charge'),
  is_show_total_discount: yup.number().required().label('Is Show Total Discount'),
  is_show_rounding: yup.number().required().label('Is Show Rounding'),
  is_show_total: yup.number().required().label('Is Show Total'),
  is_show_paid: yup.number().required().label('Is Show Paid'),
  is_show_change: yup.number().required().label('Is Show Change'),
  is_show_insta_pos_logo: yup.number().required().label('Is Show Insta Pos Logo'),
  bottom_margin: yup.number().required().label('Bottom Margin'),
  receipt_number_format: yup.number().required().label('Receipt Number Format'),
  online_receipt_text: yup.string().required().label('Online Receipt Text'),
  notes: yup.string().label('Notes'),
  is_show_table_name: yup.boolean().required().label('Is Show Table Name'),
  is_show_employee_name: yup.boolean().required().label('Is Show Employee Name'),
  is_show_order_type: yup.boolean().required().label('Is Show Order Type'),
  is_show_order_date: yup.boolean().required().label('Is Show Order Date'),
  is_show_cashier_name: yup.boolean().required().label('Is Show Cashier Name'),
  is_show_merchant_name: yup.boolean().required().label('Is Show Merchant Name')
})
