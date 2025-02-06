import React, { useEffect } from 'react'
import SettingViewLayout from 'src/views/setting/SettingViewLayout'
import { useRouter } from 'next/router'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import MuiTabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Tabs } from '@mui/material'

// ** MUI Imports

// ** Data Import
import { useAuth } from 'src/hooks/useAuth'
import GeneralTab from './components/tabs/GeneralTab'
import ProductExtraTab from './components/tabs/ProductExtraTab'
import { devMode } from 'src/configs/dev'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))
const TabPanel = styled(MuiTabPanel)(() => ({
  padding: '0px',
  marginTop: '0px'
}))

const TabList = [
  // {
  //   title: 'Category',
  //   permission: 'products.category',
  //   children: <CategoryContent />
  // },
  // {
  //   title: 'Brand',
  //   permission: 'products.category',
  //   children: <BrandContent />
  // },
  // {
  //   title: 'Unit',
  //   permission: 'products.category',
  //   children: <UnitContent />
  // },
  // {
  //   title: 'Attribute',
  //   children: <AttributeContent />
  // },
  {
    title: 'General',
    children: <GeneralTab />,
    permission: undefined
  },
  ...(devMode
    ? [
        {
          title: 'Product Extra',
          children: <ProductExtraTab />,
          permission: undefined
        }
      ]
    : [])
]

const ProductSettingPage = () => {
  const { checkPermission } = useAuth()
  const { asPath, replace } = useRouter()

  const [activeTab, setActiveTab] = useState(
    asPath.split('#')[1] ? decodeURI(asPath.split('#')[1]) : 'General'
  )

  useEffect(() => {
    if (activeTab && !['Product Extra'].includes(activeTab)) {
      replace({
        pathname: '/settings/system/product-setting',
        hash: activeTab
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <SettingViewLayout tab='product-setting'>
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Stock settings tabs '
          onChange={(e, value) => setActiveTab(value)}
        >
          {TabList.filter(
            item =>
              item.permission == undefined || (item.permission && checkPermission(item.permission))
          ).map((item, index) => (
            <Tab key={index} label={item.title} value={item.title} />
          ))}
        </Tabs>

        {TabList.map((item, index) => (
          <TabPanel
            key={index}
            value={item.title}
            sx={{
              padding: '0px',
              marginTop: '0px'
            }}
          >
            {item.children}
          </TabPanel>
        ))}
      </TabContext>
    </SettingViewLayout>
  )
}
export default ProductSettingPage
