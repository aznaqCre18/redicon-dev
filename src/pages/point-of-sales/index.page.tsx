import React, { useEffect } from 'react'
// ** React Imports
import { useState } from 'react'
// ** MUI Imports
import MuiTabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Card, Tabs } from '@mui/material'
import OutletComponent from './components/OutletComponent'
import DeviceComponent from './components/DeviceComponent'
import TableComponent from './components/TableComponent'
import { devMode } from 'src/configs/dev'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import ShiftComponent from './components/ShiftComponent'
import { pointOfSalesNavTab } from 'src/navigation/vertical'
import { useAuth } from 'src/hooks/useAuth'
import TaxServiceChargeComponent from './components/TaxServiceChargeComponent'
import ReceiptComponent from './components/ReceiptComponent'
import RoundingComponent from './components/RoundingComponent'
import SettingsComponent from './components/SettingsComponent'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))
const TabPanel = styled(MuiTabPanel)(({}) => ({
  padding: '0px',
  marginTop: '0px'
}))

const PointOfSales = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const { asPath, replace } = useRouter()
  const [activeTab, setActiveTab] = useState(asPath.split('#')[1] ?? 'Outlet')

  useEffect(() => {
    if (activeTab && !['Outlet', 'Table_Management', 'Device'].includes(activeTab)) {
      replace({
        pathname: '/point-of-sales',
        hash: activeTab
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <Card
      sx={{
        mb: 50
      }}
    >
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Website Settings Tabs'
          onChange={(e, value) => setActiveTab(value)}
        >
          {pointOfSalesNavTab.map((item, index) =>
            checkPermission(item.permission) && (item.devMode ? devMode : true) ? (
              <Tab
                label={t(item.title) ?? item.title}
                value={item.title.replaceAll(' ', '_')}
                key={index}
              />
            ) : null
          )}
        </Tabs>
        <TabPanel value={'Outlet'}>
          <OutletComponent />
        </TabPanel>
        <TabPanel value={'Table_Management'}>
          <TableComponent />
        </TabPanel>
        <TabPanel value={'Shift'}>
          <ShiftComponent />
        </TabPanel>
        <TabPanel value={'Device'}>
          <DeviceComponent />
        </TabPanel>
        <TabPanel value={'Tax_&_Service_Charge'}>
          <TaxServiceChargeComponent />
        </TabPanel>
        <TabPanel value={'Receipt'}>
          <ReceiptComponent />
        </TabPanel>
        <TabPanel value={'Rounding'}>
          <RoundingComponent />
        </TabPanel>
        <TabPanel value={'Settings'}>
          <SettingsComponent />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default PointOfSales
