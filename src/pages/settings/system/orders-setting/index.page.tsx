import React, { useEffect } from 'react'
import SettingViewLayout from 'src/views/setting/SettingViewLayout'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Tabs } from '@mui/material'
import OrderTab from './components/tabs/OrderTab'
import PrintSettingsTab from './components/tabs/PrintSettingsTab'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import AdjustmentTab from './components/tabs/AdjustmentTab'
import DivisionTab from './components/tabs/DivisionTab '

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

const StockSettingPage = () => {
  const { t } = useTranslation()
  const { asPath, replace } = useRouter()
  const [activeTab, setActiveTab] = useState(asPath.split('#')[1] ?? 'Order')

  useEffect(() => {
    if (activeTab && ![''].includes(activeTab)) {
      replace({
        pathname: '/settings/system/orders-setting',
        hash: activeTab
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <SettingViewLayout tab='orders-setting'>
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Stock settings tabs '
          onChange={(e, value) => setActiveTab(value)}
        >
          <Tab label={t('Order')} value={'Order'} />
          <Tab label={t('Print Settings')} value={'Print_Settings'} />
          <Tab label={t('Adjustment')} value={'Adjustment'} />
          <Tab label={t('Division')} value={'Division'} />
        </Tabs>
        <TabPanel
          value={'Order'}
          tabIndex={0}
          sx={{
            p: 4
          }}
        >
          <OrderTab />
        </TabPanel>
        <TabPanel
          value={'Print_Settings'}
          tabIndex={1}
          sx={{
            p: 4
          }}
        >
          <PrintSettingsTab />
        </TabPanel>
        <TabPanel
          value={'Adjustment'}
          tabIndex={1}
          sx={{
            p: 0
          }}
        >
          <AdjustmentTab />
        </TabPanel>
        <TabPanel
          value={'Division'}
          tabIndex={1}
          sx={{
            p: 0
          }}
        >
          <DivisionTab />
        </TabPanel>
      </TabContext>
    </SettingViewLayout>
  )
}
export default StockSettingPage
