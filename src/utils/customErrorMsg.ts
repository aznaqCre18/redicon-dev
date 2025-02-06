export type customErrorMsgType = {
  [key: string]: string
}

const customErrorMsg: customErrorMsgType = {
  'produk yang sudah digunakan tidak bisa di hapus':
    'Produk ini tidak bisa dihapus karena sudah pernah ada transaksi.',
  'Your phone number is not valid. Please enter your active phone number again':
    'Nomor telepon tidak valid. Silakan masukkan nomor telepon yang aktif kembali.',
  'Please waiting 30 seconds': 'Silakan tunggu 30 detik'
}

export const getErrorCustomMsg = (key: string) => {
  return customErrorMsg[key] || key
}
