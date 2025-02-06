import React from 'react'
import SettingViewLayout from 'src/views/setting/SettingViewLayout'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Tabs } from '@mui/material'
import EkspedisiTab from './components/tabs/EkspedisiTab'
// import DiantarTab from './components/tabs/DiantarTab'
import { useAuth } from 'src/hooks/useAuth'
// import AmbilSendiriTab from './components/tabs/AmbilSendiriTab'
import CourierManualTab from './components/tabs/CourierManualTab'
import CourierOutletTab from './components/tabs/CourierOutletTab'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

type TabListType = {
  title: string
  value: string
  permission?: string
  sx?: any
  children: React.ReactNode
}[]

const PaymentPage = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const { asPath } = useRouter()

  const tabList: TabListType = [
    {
      title: t('Expedition'),
      value: 'expedition',
      sx: {
        p: 0
      },
      children: <EkspedisiTab />
    },
    {
      title: t('Courier Manual'),
      value: 'courier-manual',
      sx: {
        p: 0
      },
      children: <CourierManualTab />
    },
    {
      title: t('Courier Outlet'),
      value: 'courier-outlet',
      sx: {
        p: 0
      },
      children: <CourierOutletTab />
    }
    // {
    //   title: 'Ambil Sendiri',
    //   children: <AmbilSendiriTab />
    // },
    // {
    //   title: 'Diantar',
    //   children: <DiantarTab />
    // }
    // {
    //   title: 'Marketplace',
    //   children: <MarketplaceTab />
    // },
    // {
    //   title: 'EDC',
    //   children: <EDCTab />
    // },
    // {
    //   title: 'Installment',
    //   children: <InstallmentTab />
    // }
  ]

  const [activeTab, setActiveTab] = useState(asPath.split('#')[1] ?? tabList[0].value)

  // useEffect(() => {
  //   if (activeTab && !['expedition'].includes(activeTab)) {
  //     replace({
  //       pathname: '/settings/system/shipping-setting',
  //       hash: activeTab
  //     })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeTab])
  // Bank Transfer Tab

  return (
    <SettingViewLayout tab='shipping-setting'>
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Stock settings tabs '
          onChange={(e, value) => setActiveTab(value)}
        >
          {tabList
            .filter(
              item =>
                item.permission == undefined ||
                (item.permission && checkPermission(item.permission))
            )
            .map((item, index) => (
              <Tab key={index} label={item.title} value={item.value} />
            ))}
        </Tabs>

        {tabList.map((item, index) => (
          <TabPanel key={index} sx={item.sx} value={item.value}>
            {item.children}
          </TabPanel>
        ))}
      </TabContext>
    </SettingViewLayout>
  )
}
export default PaymentPage
