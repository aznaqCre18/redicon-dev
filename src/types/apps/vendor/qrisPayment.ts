export interface QRISPaymentData {
  outlet_id: number
  qr_image: string | null | File
  status: boolean
}
