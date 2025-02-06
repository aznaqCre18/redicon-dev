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
import BankTransferTab from './components/tabs/BankTransferTab'
import MidtransTab from './components/tabs/MidtransTab'
import { useAuth } from 'src/hooks/useAuth'
import MootaTab from './components/tabs/MootaTab'
import CODTab from './components/tabs/CODTab'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import NonCashTab from './components/tabs/NonCashTab'
import XenditTab from './components/tabs/XenditTab'
import DanaPaymentTab from './components/tabs/DanaPaymentTab'
import QrisStatisTab from './components/tabs/QrisStatisTab'
import { devMode } from 'src/configs/dev'

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
  const { asPath, replace } = useRouter()

  const tabList: TabListType = [
    {
      title: t('Non Cash'),
      value: 'non-cash',
      sx: {
        p: 0
      },
      children: <NonCashTab />
    },
    {
      title: t('Bank Transfer'),
      value: 'bank-transfer',
      sx: {
        p: 0
      },
      children: <BankTransferTab />
    },
    {
      title: 'Moota',
      value: 'moota',
      sx: {
        p: 5
      },
      children: <MootaTab />
    },
    {
      title: 'Midtrans',
      value: 'midtrans',
      sx: {
        p: 5
      },
      children: <MidtransTab />
    },
    {
      title: 'Xendit',
      value: 'xendit',
      sx: {
        p: 5
      },
      children: <XenditTab />
    },
    // {
    //   title: 'Marketplace',
    //   children: <MarketplaceTab />
    // },
    // {
    //   title: 'EDC',
    //   children: <EDCTab />
    // },
    {
      title: 'COD',
      value: 'cod',
      sx: {
        p: 5
      },
      children: <CODTab />
    },
    ...(devMode
      ? [
          {
            title: 'QRIS Dinamis',
            value: 'qris-dinamis',
            sx: {
              p: 5
            },
            children: <DanaPaymentTab />
          },
          {
            title: 'QRIS Statis',
            value: 'qris-statis',
            sx: {
              p: 5
            },
            children: <QrisStatisTab />
          }
        ]
      : [])

    // {
    //   title: 'Installment',
    //   children: <InstallmentTab />
    // }
  ]

  const [activeTab, setActiveTab] = useState(asPath.split('#')[1] ?? tabList[0].value)

  useEffect(() => {
    if (activeTab && !['bank-transfer', 'non-cash'].includes(activeTab)) {
      replace({
        pathname: '/settings/system/payment-setting',
        hash: activeTab
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  // Bank Transfer Tab

  return (
    <SettingViewLayout tab='payment-setting'>
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
