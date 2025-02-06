import { useContext } from 'react'
import { AppContext } from 'src/context/AppContext'

export const useApp = () => useContext(AppContext)
