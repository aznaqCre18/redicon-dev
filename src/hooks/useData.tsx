import { useContext } from 'react'
import { DataContext } from 'src/context/DataContext'

export const useData = () => useContext(DataContext)
