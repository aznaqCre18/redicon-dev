// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Card } from '@mui/material'
import Nav from '../Nav'
import generalSettingList from 'src/constants/general-settings-tabs'

interface UserViewType {
  tab: string
  children: React.ReactNode | React.ReactNode
}
const GeneralSettingLayout = ({ tab, children }: UserViewType) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4} lg={3}>
        <Card>
          <Nav tab={tab} list={generalSettingList} />
        </Card>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        <Card>{children}</Card>
      </Grid>
    </Grid>
  )
}

export default GeneralSettingLayout
