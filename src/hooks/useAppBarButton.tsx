import { atom, useAtom } from 'jotai'
import { ReactNode } from 'react'

const buttonLeftAtom = atom<ReactNode | undefined>(undefined)
const buttonRightAtom = atom<ReactNode | undefined>(undefined)

const useAppBarButton = () => {
  const [buttonLeft, setButtonLeft] = useAtom(buttonLeftAtom)

  const [buttonRight, setButtonRight] = useAtom(buttonRightAtom)

  return { buttonLeft, setButtonLeft, buttonRight, setButtonRight }
}

export default useAppBarButton
