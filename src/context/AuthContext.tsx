// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, RegisterParams, UserAuthType } from './types'
import { ProfilPermissionV2Type } from 'src/types/apps/profileType'
import { ProfileType } from 'src/types/apps/dashboard/profile'

// ** Utils
import { checkPermission as checkPermissionUtils } from 'src/utils/permissionUtils'
import { VendorProfileModuleType, VendorProfileType } from 'src/types/apps/vendor/profile'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  maxOutlet: 0,
  maxDevice: 0,
  bussiness: null,
  vendorProfile: null,
  vendorProfileModule: [],
  permissions: [],
  loading: true,
  checkPermission: () => {
    return true
  },
  checkModuleVendor: () => {
    return true
  },
  setUser: () => null,
  setBussiness: () => null,
  setVendorProfile: () => null,
  setVendorProfileModule: () => null,
  setLoading: () => Boolean,
  initAuth: () => Promise.resolve(),
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [vendorProfile, setVendorProfile] = useState<VendorProfileType | null>(
    defaultProvider.vendorProfile
  )
  const [vendorProfileModule, setVendorProfileModule] = useState<VendorProfileModuleType[]>([])
  const [user, setUser] = useState<UserAuthType | null>(defaultProvider.user)
  const [maxOutlet, setMaxOutlet] = useState<number>(defaultProvider.maxOutlet)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [maxDevice, setMaxDevice] = useState<number>(0)
  const [bussiness, setBussiness] = useState<ProfileType | null>(defaultProvider.bussiness)
  const [permissions, setPermissions] = useState<string[]>(defaultProvider.permissions)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  const initAuth = async (): Promise<void> => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
    if (storedToken) {
      setLoading(true)
      await axios
        .get(authConfig.profileEndpoint, {
          headers: {
            Authorization: storedToken,
            'Content-Type': 'application/json'
          }
        })
        .then(async response => {
          // const user = response.data.data
          setUser({
            ...response.data.data,
            role: 'admin',
            superadmin: true
          })

          // setMaxDevice(response?.data?.data?.subscription?.maximum_device ?? 0)
          // setMaxOutlet(response?.data?.data?.subscription?.maximum_outlet ?? 0)

          // DISABLE WHEN UPDATE ENDPOINT API
          // await axios
          //   .get(authConfig.profileBusinessEndpoint, {
          //     headers: {
          //       Authorization: storedToken,
          //       'Content-Type': 'application/json'
          //     }
          //   })
          //   .then(async response => {
          //     setBussiness(response.data.data)
          //   })
          //   .catch(err => {
          //     handleLogout()

          //     console.log('error profile business')
          //     console.log(err)
          //   })

          // await axios
          //   .get(authConfig.permissionEndpoint, {
          //     headers: {
          //       Authorization: storedToken
          // 'Content-Type': 'application/json'
          //     }
          //   })
          //   .then(async response => {
          //     const _permission: string[] = []
          //     ;((response.data.data as ProfilPermissionType[]) ?? []).forEach(parent => {
          //       ;(parent.modules ?? []).forEach(module => {
          //         ;(module.permissions ?? []).forEach(permission => {
          //           if (permission.value || user.role.is_default)
          //             _permission.push(`${parent.name}.${module.name}.${permission.name}`)
          //         })
          //       })
          //     })

          //     setPermissions(_permission)
          //     setLoading(false)
          //   })
          //   .catch(err => {
          //     console.log('error permission')
          //     console.log(err)

          //     localStorage.removeItem('userData')
          //     localStorage.removeItem('refreshToken')
          //     localStorage.removeItem(authConfig.storageTokenKeyName)
          //     setUser(null)
          //     setLoading(false)

          //     if (!router.pathname.includes('login')) {
          //       router.replace('/login')
          //     }
          //   })

          await axios
            .get(authConfig.permissionEndpoint, {
              headers: {
                Authorization: storedToken,
                'Content-Type': 'application/json'
              }
            })
            .then(async response => {
              const responseData = response.data
              // const responseData = example

              const _permission: string[] = []
              ;((responseData.data as ProfilPermissionV2Type[]) ?? []).forEach(parent => {
                ;(parent.permission ?? []).forEach(permission => {
                  _permission.push(`${parent.module}.${permission}`.toLocaleLowerCase())
                })
              })

              setPermissions(_permission)
              setLoading(false)
            })
            .catch(err => {
              console.log('error permission')
              console.log(err)

              localStorage.removeItem('userData')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem(authConfig.storageTokenKeyName)
              setUser(null)
              setLoading(false)

              if (!router.pathname.includes('login')) {
                router.replace('/login')
              }
            })

          // DISABLE WHEN UPDATE ENDPOINT API
          // await axios
          //   .get(authConfig.vendorProfileEndpoint, {
          //     headers: {
          //       Authorization: storedToken,
          //       'Content-Type': 'application/json'
          //     }
          //   })
          //   .then(async response => {
          //     setMaxOutlet(response.data.data?.vendor?.limit_outlet ?? 1)
          //     setVendorProfile(response.data.data ?? [])
          //   })
          //   .catch(err => {
          //     console.log('error profile module')
          //     console.log(err)
          //   })

          // DISABLE WHEN UPDATE ENDPOINT API
          // await axios
          //   .get(authConfig.vendorProfileModuleEndpoint, {
          //     headers: {
          //       Authorization: storedToken,
          //       'Content-Type': 'application/json'
          //     }
          //   })
          //   .then(async response => {
          //     setVendorProfileModule(response.data.data ?? [])
          //   })
          //   .catch(err => {
          //     console.log('error profile module')
          //     console.log(err)
          //   })
        })
        .catch(err => {
          console.log('error profile')
          console.log(err)

          localStorage.removeItem('userData')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem(authConfig.storageTokenKeyName)
          setUser(null)
          setLoading(false)

          if (!router.pathname.includes('login')) {
            router.replace('/login')
          }
        })
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType, redirectUrl = '/') => {
    axios
      .post(authConfig.loginEndpoint, params, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(
              authConfig.storageTokenKeyName,
              'Bearer ' + response.data.data.access_token
            )
          : null
        const returnUrl = router.query.returnUrl
        const config = {
          headers: {
            Authorization: 'Bearer ' + response.data.data.access_token,
            'Content-Type': 'application/json'
          }
        }
        axios.get(authConfig.profileEndpoint, config).then(response => {
          setUser({
            ...response.data.data,
            role: 'admin',
            // superadmin: response.data.data.role.is_default
            superadmin: true
          })
          params.rememberMe
            ? window.localStorage.setItem(
                'userData',
                JSON.stringify({
                  ...response.data.data,
                  role: 'admin',
                  // superadmin: response.data.data.role.is_default
                  superadmin: true
                })
              )
            : null

          const redirectURL = redirectUrl || (returnUrl && returnUrl !== '/' ? returnUrl : '/')
          router.replace(redirectURL as string)

          initAuth()
        })
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const register = (params: RegisterParams, errorCallback?: (err: string) => void) => {
    axios
      .post(
        authConfig.registerEndpoint,
        {
          ...params,
          language_id: 1,
          role_id: 1,
          department_id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(async response => {
        const returnUrl = router.query.returnUrl
        console.log(response)
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        const message = err.response.data.message || err.message
        if (errorCallback) errorCallback(message)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const checkPermission = (permission?: string): boolean => {
    if (!permission) return true

    if (permission.includes('vendor')) {
      const vendorId = user?.user.vendor_id
      const _vendorId = permission.split('-')[1]
      if (vendorId == parseInt(_vendorId)) {
        return true
      }

      return false
    }

    return checkPermissionUtils(permissions, permission)
  }

  const checkModuleVendor = (module?: string): boolean => {
    if (!module) return true

    return vendorProfileModule.find(item => item.slug == module) ? true : false
  }

  const values = {
    user,
    maxOutlet,
    maxDevice,
    permissions,
    loading,
    bussiness,
    vendorProfile,
    vendorProfileModule,
    checkPermission,
    checkModuleVendor,
    setUser,
    setBussiness,
    setVendorProfile,
    setVendorProfileModule,
    setLoading,
    register,
    initAuth,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
