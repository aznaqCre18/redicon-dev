export const formatPriceIDR = (price: number, maxComa?: number) => {
  // fix for NaN
  if (isNaN(price)) {
    return `Rp 0`
  }

  return `Rp ${(price ?? 0).toLocaleString('id-ID', { maximumFractionDigits: maxComa ?? 2 })}`
}

export const formatNumber = (number: number) => {
  try {
    return number.toLocaleString('id-ID')
  } catch (error) {
    return (number ?? '0').toString()
  }
}

export const formatNumberMax2digit = (number: number) => {
  return number.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

export const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

export const NaNZero = (num: number) => (isNaN(num) ? 0 : num)

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const formatPhone = (phone: string): string => {
  const value = phone
  let newValue = value.replace(/[^0-9+]/g, '')
  const hasPlus = newValue.match(/\+/g)
  if (hasPlus && hasPlus.length > 0) {
    newValue = newValue.replace(/\+/g, (m, i) => (i === 0 && value.charAt(0) == '+' ? m : ''))
  }

  return newValue
}
