import { useCallback, useState } from 'react'

export const useDisclosure = (defaultValue = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultValue)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])

  return { isOpen, onClose, onOpen }
}
