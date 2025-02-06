import CryptoJS from 'crypto-js'

const secretPassphrase = 'instasoft-crypt'

export const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, secretPassphrase).toString()
}

export const decrypt = (data: string) => {
  const bytes = CryptoJS.AES.decrypt(data, secretPassphrase)

  return bytes.toString(CryptoJS.enc.Utf8)
}
