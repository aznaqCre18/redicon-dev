/* eslint-disable @typescript-eslint/no-unused-vars */
// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import Nav from './Nav'
import { Card } from '@mui/material'
import systemSettingList from 'src/constants/system-setting-list'
// import { useAuth } from 'src/hooks/useAuth'
// import { checkPermission } from 'src/utils/permissionUtils'

interface UserViewType {
  tab: string
  children: React.ReactNode | React.ReactNode
}

const SettingViewLayout = ({ tab, children }: UserViewType) => {
  // const auth = useAuth()

  return (
    <Grid container spacing={4} mb={16}>
      {/* <Grid item xs={12} md={4} lg={3}>
        <Card>
          <Nav
            tab={tab}
            // list={systemSettingList.filter(
            //   item =>
            //     item.permission == undefined ||
            //     (auth.permissions &&
            //       item.permission &&
            //       checkPermission(auth.permissions, item.permission))
            // )}
            list={systemSettingList}
          />
        </Card>
      </Grid> */}
      {/* <Grid item xs={12} md={8} lg={9}> */}
      <Grid item xs={12} md={12} lg={12}>
        <Card>{children}</Card>
      </Grid>
    </Grid>
  )
}

export default SettingViewLayout
