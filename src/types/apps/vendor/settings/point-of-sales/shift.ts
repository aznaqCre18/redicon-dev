import * as yup from 'yup'

export type ShiftData = {
  id: number
  vendor_id: string
  is_cashier_open: boolean
  cashier_cash_nominal: number
  is_auto_close_cashier: boolean
  auto_close_cashier_time: string
  is_input_saldo_akhir: boolean
}

export interface ShiftType extends ShiftData {
  outlet_id: number
  created_at: Date
  created_by: number | null
  updated_at: Date
  updated_by: number | null
}

export const ShiftSchema = yup.object<ShiftData>().shape({
  is_cashier_open: yup.boolean().required().label('Buka Kasir'),
  cashier_cash_nominal: yup.number().required().label('Nominal Kas Awal'),
  is_auto_close_cashier: yup.boolean().required().label('Tutup Kasir Otomatis'),
  auto_close_cashier_time: yup.string().required().label('Atur Waktu Tutup Kasir Otomatis'),
  is_input_saldo_akhir: yup.boolean().required().label('Input Saldo Akhir')
})
