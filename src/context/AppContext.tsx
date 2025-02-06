// ** React Imports
import { createContext, ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  errorInput as _errorInput,
  translateFormYupMsg as _translateFormYupMsg
} from 'src/utils/formUtils'

export type AppValuesType = {
  menuActive: string[]
  setMenuActive: (menu: string[]) => void
  currentMenuActive: string[]
  setCurrentMenuActive: (menu: string[]) => void
  lang: 'id' | 'en'
  setLang: (lang: 'id' | 'en') => void
  errorInput: (
    errors: any,
    name: string,
    customValue?: boolean,
    lang?: 'id' | 'en'
  ) => {
    error: boolean
    helperText: any
  }
  translateFormYupMsg: (msg: string | undefined, lang?: 'id' | 'en') => string | undefined
}

// ** Defaults
const defaultProvider: AppValuesType = {
  menuActive: [],
  setMenuActive: () => Promise.resolve(),
  currentMenuActive: [],
  setCurrentMenuActive: () => Promise.resolve(),
  lang: 'en',
  setLang: () => Promise.resolve(),
  errorInput: () => {
    return {
      error: false,
      helperText: ''
    }
  },
  translateFormYupMsg: () => ''
}

const AppContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AppProvider = ({ children }: Props) => {
  // ** States
  const {
    i18n: { language, changeLanguage }
  } = useTranslation()

  const [menuActive, setMenuActive] = useState<string[]>([])
  const [currentMenuActive, setCurrentMenuActive] = useState<string[]>([])

  const setLang = (lang: 'id' | 'en') => {
    localStorage.setItem('locale', lang ?? 'en')

    changeLanguage(lang)
  }

  const errorInput = (
    errors: any,
    name: string,
    customValue?: boolean
  ): {
    error: boolean
    helperText: any
  } => {
    return _errorInput(errors, name, customValue, language as any)
  }

  const translateFormYupMsg = (msg: string | undefined, lang?: 'id' | 'en'): string | undefined => {
    return _translateFormYupMsg(msg, lang)
  }

  useEffect(() => {
    if (localStorage.getItem('locale')) setLang(localStorage.getItem('locale') as 'id' | 'en')
    else setLang('en')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const values = {
    menuActive,
    setMenuActive,
    currentMenuActive,
    setCurrentMenuActive,
    lang: language as any,
    setLang,
    errorInput,
    translateFormYupMsg
  }

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>
}

export { AppContext, AppProvider }
