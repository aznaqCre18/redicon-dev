import React, { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const ExpiredPage = () => {
  return <div></div>
}

export default ExpiredPage

ExpiredPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
