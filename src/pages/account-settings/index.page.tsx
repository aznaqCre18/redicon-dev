import React from 'react'
import BusinessDetail from './components/BusinessDetail'
import AccountViewLayout from './components/AccountViewLayout'

const Page = () => {
  return (
    <AccountViewLayout tab='account-business-detail'>
      <div style={{ padding: 16 }}>
        <BusinessDetail />
      </div>
    </AccountViewLayout>
  )
}

export default Page
