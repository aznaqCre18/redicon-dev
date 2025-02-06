export type ResponseType = {
  data: {
    status: boolean
    message: string
  }
}

export type ResponseTypeWithData<T> = {
  data: {
    status: boolean
    message: string
    data: T
  }
}
