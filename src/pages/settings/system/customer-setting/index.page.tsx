import CustomerSetting from './CustomerSetting'
import SettingViewLayout from 'src/views/setting/SettingViewLayout'

const CustomerView = () => {
  return (
    <SettingViewLayout tab='customer-setting'>
      <CustomerSetting />
    </SettingViewLayout>
  )
}

export default CustomerView
