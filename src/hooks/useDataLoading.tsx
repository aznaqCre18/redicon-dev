import { useCallback, useState } from 'react'

export type DataLoadingType<T> = {
  isLoading: boolean
  data: T[]
  setLoading: (loading: boolean) => void
  onLoading: () => void
  onLoaded: (data: T[]) => void
}

export function useDataLoading<S>(defaultValue: S, loading = true) {
  const [data, setData] = useState<S>(defaultValue)
  const [isLoading, setIsLoading] = useState<boolean>(loading)

  const onLoading = useCallback(() => setIsLoading(true), [])

  const onLoaded = useCallback((data: S) => {
    setData(data)
    setIsLoading(false)
  }, [])

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), [])

  return { isLoading, data, onLoading, onLoaded, setLoading }
}
