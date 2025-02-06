import format from 'date-fns/format'
import { formatDateFilter } from './dateUtils'
import { addDays } from 'date-fns'

export const rangeDateNewConvert = (options: any) => {
  const { created_at, ...rest } = options || ({} as any)

  const explode = created_at ? created_at.split('~') : []
  const start_date = explode[0]
  let end_date = explode[1]
  // add one day
  end_date = formatDateFilter(addDays(new Date(end_date), 1))
  const newOptions = { ...rest, start_date, end_date }

  return newOptions
}

export const rangeDateValue = (start: Date, end: Date) => {
  try {
    const startDate = format(start, 'yyyy-MM-dd')
    const endDate = end !== null ? `~${format(end, 'yyyy-MM-dd')}` : null

    return `${startDate}${endDate !== null ? endDate : ''}`
  } catch (error) {
    return ''
  }
}

export const parseRangeDateValue = (date: string) => {
  try {
    const [startDate, endDate] = date.split('~')

    return {
      startDate: new Date(startDate),
      endDate: endDate !== undefined ? new Date(endDate) : null
    }
  } catch (error) {
    return {
      startDate: new Date(),
      endDate: null
    }
  }
}

export const parseRangeDateValueStr = (date?: string, endPlusOne?: boolean) => {
  if (!date)
    return {
      start_date: formatDateFilter(new Date()),
      end_date: formatDateFilter(addDays(new Date(), endPlusOne ? 1 : 0))
    }

  try {
    const [startDate, endDate] = date.split('~')

    return {
      start_date: formatDateFilter(new Date(startDate)),
      end_date: formatDateFilter(
        addDays(endDate !== undefined ? new Date(endDate) : new Date(), endPlusOne ? 1 : 0)
      )
    }
  } catch (error) {
    return {
      start_date: formatDateFilter(new Date()),
      end_date: formatDateFilter(addDays(new Date(), endPlusOne ? 1 : 0))
    }
  }
}

type DiffCreateUpdateOptions = {
  create: number[]
  delete: number[]
}
export const diffCreateUpdate = (data: {
  new: number[]
  old: number[]
}): DiffCreateUpdateOptions => {
  const create = data.new.filter(id => !data.old.includes(id))
  const deleteData = data.old.filter(id => !data.new.includes(id))

  return {
    create,
    delete: deleteData
  }
}
