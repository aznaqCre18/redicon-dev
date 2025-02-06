import { ProfileType } from 'src/types/apps/dashboard/profile'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { VendorProfileModuleType, VendorProfileType } from 'src/types/apps/vendor/profile'

export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  user: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  email: string
  password: string
  username: string
  name: string
  phone: string
}

export type UserDataType = {
  created_at: Date
  created_by: number
  department_id: number
  email: string
  id: number
  language_id: number
  last_login: Date
  name: string
  phone: string
  profile_picture?: string
  role_id: number
  updated_at: Date
  updated_by: number | null
  username: string
  vendor_id: number
  is_supervisor: boolean
}

export type UserAuthType = {
  outlets: OutletType[]
  user: UserDataType
  role: string
  superadmin: boolean
}

export type AuthValuesType = {
  register: (params: RegisterParams, errorCallback?: (err: string) => void) => void
  loading: boolean
  logout: () => void
  user: UserAuthType | null
  maxOutlet: number
  maxDevice: number
  bussiness: ProfileType | null
  vendorProfile: VendorProfileType | null
  vendorProfileModule: VendorProfileModuleType[]
  permissions: string[]
  checkPermission: (permission?: string) => boolean
  checkModuleVendor: (module?: string) => boolean
  initAuth: () => void
  setLoading: (value: boolean) => void
  setUser: (value: UserAuthType | null) => void
  setBussiness: (value: ProfileType) => void
  setVendorProfile: (value: VendorProfileType) => void
  setVendorProfileModule: (value: VendorProfileModuleType[]) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType, redirectUrl?: string) => void
}
