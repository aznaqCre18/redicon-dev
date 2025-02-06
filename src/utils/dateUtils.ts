import { addHours, format } from 'date-fns'
import IdLocale from 'date-fns/locale/id'
import EnLocale from 'date-fns/locale/en-US'

export const getLocale = () => {
  try {
    return localStorage.getItem('locale') || 'id'
  } catch (error) {
    return 'id'
  }
}

export const formatDateOnly = (
  date: Date | string | number,
  fullMonth?: boolean,
  adjust = -7
): string =>
  format(
    typeof date == 'string' ? addHours(new Date(date), adjust) : date,
    fullMonth ? 'dd MMMM yyyy' : 'dd MMM yyyy',
    {
      locale: getLocale() === 'id' ? IdLocale : EnLocale
    }
  ).toString()

export const formatDate = (date: Date | string | number, adjust = -7): string =>
  format(typeof date == 'string' ? addHours(new Date(date), adjust) : date, 'dd MMM yyyy HH:mm', {
    locale: getLocale() === 'id' ? IdLocale : EnLocale
  }).toString()

// 16-01-2024 12:00:00
export const formatDatePrint = (DateTime: Date | string | number): string =>
  format(
    typeof DateTime == 'string' ? addHours(new Date(DateTime), -7) : DateTime,
    'dd-MM-yyyy HH:mm',
    {
      locale: getLocale() === 'id' ? IdLocale : EnLocale
    }
  ).toString()

export const formatDateTable = (date: Date | string | number, adjust = -7): string =>
  format(typeof date == 'string' ? addHours(new Date(date), adjust) : date, 'dd MMMM yyyy, HH:mm', {
    locale: getLocale() === 'id' ? IdLocale : EnLocale
  }).toString()

export const formatDateTimestamp = (date: Date | string | number): string =>
  format(typeof date == 'string' ? addHours(new Date(date), -7) : date, 'dd MMM yyyy HH:mm:ss', {
    locale: getLocale() === 'id' ? IdLocale : EnLocale
  }).toString()

export const formatDateFilter = (date: Date | string | number): string =>
  format(typeof date == 'string' ? addHours(new Date(date), -7) : date, 'yyyy-MM-dd', {
    locale: getLocale() === 'id' ? IdLocale : EnLocale
  }).toString()

export const formatDateInput = (date: Date | string | number): string =>
  format(typeof date == 'string' ? addHours(new Date(date), -7) : date, 'yyyy-MM-dd HH:mm:00', {
    locale: getLocale() === 'id' ? IdLocale : EnLocale
  }).toString()

export const isSameDate = (date1: Date, date2: Date): boolean =>
  date1?.getFullYear() === date2?.getFullYear() &&
  date1?.getMonth() === date2?.getMonth() &&
  date1?.getDate() === date2?.getDate()

export const periodeDateString = (start: Date, end: Date): string => {
  const startDate = formatDateOnly(start, true)
  const endDate = formatDateOnly(end, true)

  if (isSameDate(start, end)) return startDate

  return `${startDate} - ${endDate}`
}
