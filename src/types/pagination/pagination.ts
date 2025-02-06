export type PageOptionRequestType = {
  limit: number
  page: number
  sort?: 'asc' | 'desc'
  order?: string
  [key: string]: string | number | null | undefined
}

export const defaultPagination: PageOptionRequestType = {
  limit: 250,
  page: 1,
  sort: 'asc',
  order: 'created_at'
}

export const defaultPaginationDesc: PageOptionRequestType = {
  limit: 25,
  page: 1,
  sort: 'desc',
  order: 'created_at'
}

export const maxLimitPagination: PageOptionRequestType = {
  limit: 9999,
  page: 1,
  sort: 'asc',
  order: 'created_at'
}

export type ScrollPaginationData<T> = {
  params?: string
  pagination: PageOptionRequestType
  data?: T[]
}
