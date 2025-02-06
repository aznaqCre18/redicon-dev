// ** Third Party Imports
import { useRouter } from 'next/router'

const SettingView = () => {
  const router = useRouter()
  router.push('/settings/system/orders-setting')

  return null
}

export default SettingView
