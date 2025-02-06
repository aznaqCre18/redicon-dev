import React, { useEffect } from 'react'
// ** React Imports
import { useState } from 'react'
// ** MUI Imports
import TabPanel from '@mui/lab/TabPanel'
import MuiTabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Card, Tabs } from '@mui/material'
import CMSComponent from './tabs/CMSComponent'
import FeaturesComponent from './tabs/FeaturesComponent'
import ShortcutIconComponent from './tabs/ShortcutIconComponent'
import UpdateInformationComponent from './tabs/UpdateInformationComponent'
import LoginSettingComponent from './tabs/LoginSettingComponent'
import OrderComponent from './tabs/OrderComponent'
import PrintSettingComponent from './tabs/PrintSettingComponent'
import WebPageComponent from './tabs/WebPage'
import BannerComponent from './tabs/Banner'
import { devMode } from 'src/configs/dev'
import { useTranslation } from 'react-i18next'
import GeneralComponent from './tabs/GeneralComponent'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { onlineStoreNavTab } from 'src/navigation/vertical'
import TaxTab from './tabs/TaxTab'
// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))
const TabPanelNoPadding = styled(MuiTabPanel)(({}) => ({
  padding: '0px',
  marginTop: '0px'
}))

const ApplicationPage = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const { asPath, replace } = useRouter()
  const [activeTab, setActiveTab] = useState(asPath.split('#')[1] ?? 'General')

  useEffect(() => {
    if (activeTab && !['Banner', 'Shortcut'].includes(activeTab)) {
      replace({
        pathname: '/online-store',
        hash: activeTab
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <Card>
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Stock settings tabs '
          onChange={(e, value) => setActiveTab(value)}
        >
          {onlineStoreNavTab.map((item, index) =>
            checkPermission(item.permission) && (item.devMode ? devMode : true) ? (
              <Tab
                label={t(item.title) ?? item.title}
                value={item.title.replaceAll(' ', '_')}
                key={index}
              />
            ) : null
          )}
          {/* <Tab label='Third Party' value={'Third Party'} /> */}
          {/* <Tab label='Order' value={'Order'} />
          <Tab label='Print Setting' value={'Print Setting'} /> */}
        </Tabs>
        <TabPanel value={'General'} tabIndex={0}>
          <GeneralComponent />
        </TabPanel>
        <TabPanel value={'CMS'} tabIndex={0}>
          <CMSComponent />
        </TabPanel>
        <TabPanelNoPadding value={'Pages'} tabIndex={0}>
          <WebPageComponent />
        </TabPanelNoPadding>
        <TabPanel value={'Features'} tabIndex={0}>
          <FeaturesComponent />
        </TabPanel>
        <TabPanelNoPadding value={'Banner'} tabIndex={0}>
          <BannerComponent />
        </TabPanelNoPadding>
        <TabPanelNoPadding value={'Shortcut'} tabIndex={0}>
          <ShortcutIconComponent />
        </TabPanelNoPadding>
        <TabPanel value={'Update'} tabIndex={0}>
          <UpdateInformationComponent />
        </TabPanel>
        <TabPanel value={'Login_Setting'} tabIndex={0}>
          <LoginSettingComponent />
        </TabPanel>
        <TabPanel value={'Tax'} tabIndex={0}>
          <TaxTab />
        </TabPanel>
        <TabPanel value={'Order'} tabIndex={0}>
          <OrderComponent />
        </TabPanel>
        <TabPanel value={'Print Setting'} tabIndex={0}>
          <PrintSettingComponent />
        </TabPanel>
      </TabContext>
    </Card>
  )
}
export default ApplicationPage
