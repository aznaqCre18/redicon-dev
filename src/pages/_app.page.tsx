import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import appConfig from 'src/configs/app'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

// ** React Imports
import { ReactNode, useRef } from 'react'

// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'
import { Provider as JotaiProvider } from 'jotai'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthProvider } from 'src/context/AuthContext'
import { AppProvider } from 'src/context/AppContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

import 'src/iconify-bundle/icons-bundle-react'

// ** Global css styles
import '../../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { DataProvider } from 'src/context/DataContext'
import DialogOutletExpired from 'src/components/dialog/DialogOutletExpired'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

// ** Configure JSS & ClassName

const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false
  const getLayout =
    Component.getLayout ??
    (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined

  const authGuard = Component.authGuard ?? true

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj

  const queryClientRef = useRef<QueryClient | null>(null)

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: { refetchOnWindowFocus: false }
      }
    })
  }

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{appConfig.appTitleHome}</title>
          <meta name='description' content={appConfig.appDescription} />
          <meta name='keywords' content={appConfig.appKeywords} />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
          <GoogleAnalytics gaId='G-2X3ZKE7623' />
          <GoogleTagManager gtmId='GTM-N4Z6DFHM' />
        </Head>

        <ReactHotToast>
          <Toaster position={'top-right'} toastOptions={{ className: 'react-hot-toast' }} />
        </ReactHotToast>

        <JotaiProvider>
          {/* Must bump version but its hard for now */}
          {/* @ts-expect-error */}
          <QueryClientProvider client={queryClientRef.current}>
            <AppProvider>
              <AuthProvider>
                <DataProvider>
                  <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
                    <SettingsConsumer>
                      {({ settings }) => {
                        return (
                          <ThemeComponent settings={settings}>
                            <Guard authGuard={authGuard} guestGuard={guestGuard}>
                              <AclGuard
                                aclAbilities={aclAbilities}
                                guestGuard={guestGuard}
                                authGuard={authGuard}
                              >
                                {getLayout(<Component {...pageProps} />)}
                                {/* DISABLE WHEN UPDATE ENDPOINT API  (HIDE SUBSCRIPTION MODAL) */}
                                {/* <DialogOutletExpired /> */}
                              </AclGuard>
                            </Guard>
                          </ThemeComponent>
                        )
                      }}
                    </SettingsConsumer>
                  </SettingsProvider>
                </DataProvider>
              </AuthProvider>
            </AppProvider>
          </QueryClientProvider>
        </JotaiProvider>
      </CacheProvider>
    </Provider>
  )
}

export default App
