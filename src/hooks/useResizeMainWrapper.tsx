import { atom, useAtom } from 'jotai'

type ResizeMainWrapperType = {
  width: number
  height: number
}

export const resizeMainWrapperAtom = atom<ResizeMainWrapperType>({
  width: 0,
  height: 0
})

export const useResizeMainWrapper = () => {
  const [resizeMainWrapper, setResizeMainWrapper] = useAtom(resizeMainWrapperAtom)

  const handleResizeMainWrapper = (width: number, height: number) => {
    setResizeMainWrapper({ width, height })
  }

  return {
    resizeMainWrapper,
    handleResizeMainWrapper
  }
}
