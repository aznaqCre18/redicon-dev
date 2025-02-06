// ** React Imports
import { useState } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'

// ** Demo Components Imports
import { Tabs } from '@mui/material'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

const CustomerSetting = () => {
  // ** State
  const [activeTab, setActiveTab] = useState('royalty-point')

  return (
    <TabContext value={activeTab}>
      <Tabs
        style={{
          borderBottom: 'none'
        }}
        value={activeTab}
        aria-label='Stock settings tabs '
        onChange={(e, value) => setActiveTab(value)}
      >
        <Tab value='royalty-point' label='Royalty Point' />
      </Tabs>
      <Box>
        <TabPanel sx={{ p: 0 }} value='royalty-point'></TabPanel>
      </Box>
    </TabContext>
  )
}

export default CustomerSetting
