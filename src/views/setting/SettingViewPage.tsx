// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import Nav from './Nav'
import { Card } from '@mui/material'
import CustomerSetting from 'src/pages/settings/system/customer-setting/CustomerSetting'

interface UserViewType {
  tab: string
}

const UserView = ({ tab }: UserViewType) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} lg={3} style={{ borderRight: '1px solid #dedede' }}>
          <Nav tab={tab} list={[]} />
        </Grid>
        <Grid item xs={12} md={8} lg={9} style={{ paddingLeft: 0 }}>
          {tab === 'customer-setting' ? <CustomerSetting /> : null}
          {tab === 'stock-setting' ? <h1>Stock Settings</h1> : null}
        </Grid>
      </Grid>
    </Card>
  )
}

export default UserView
