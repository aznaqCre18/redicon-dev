// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import { Card } from '@mui/material'
import Nav from './Nav'
import accountsTabs from 'src/constants/accounts-tabs'

interface UserViewType {
  tab: string
  children: React.ReactNode | React.ReactNode
}

const AccountViewLayout = ({ tab, children }: UserViewType) => {
  return (
    <Grid container spacing={4} mb={16}>
      <Grid item xs={12} md={4} lg={3}>
        <Card>
          <Nav tab={tab} list={accountsTabs} />
        </Card>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Card>{children}</Card>
      </Grid>
    </Grid>
  )
}

export default AccountViewLayout
