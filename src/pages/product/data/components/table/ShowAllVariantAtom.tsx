import { atom, useAtom } from 'jotai'

const showAllVariantIdAtom = atom<number | null>(null)

const useShowAllVariant = () => {
  const [showAllVariantId, setShowAllVariantId] = useAtom(showAllVariantIdAtom)

  return { showAllVariantId, setShowAllVariantId }
}

export default useShowAllVariant
