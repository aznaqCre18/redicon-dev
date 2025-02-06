import React from 'react'
import SettingViewLayout from 'src/views/setting/SettingViewLayout'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import { Button, InputLabel, List, ListItem, Tabs } from '@mui/material'
import { Box } from '@mui/system'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useImmer } from 'use-immer'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1.5)
  }
}))

const StockSettingPage = () => {
  const [state, setState] = useImmer({
    minimumStockAlert: '3 Pcs',
    stockUpdateAfter: 'Add to cart/Check out',
    limitedStatusStock: '2 Pcs'
  })
  const [activeTab, setActiveTab] = useState('Warehouse')

  const onChangeState = React.useCallback(
    (key: keyof typeof state, value: string) => {
      setState(draft => {
        draft[key] = value
      })
    },
    [setState]
  )

  return (
    <SettingViewLayout tab='stock-setting'>
      <TabContext value={activeTab}>
        <Tabs
          style={{
            borderBottom: 'none'
          }}
          value={activeTab}
          aria-label='Stock settings tabs '
          onChange={(e, value) => setActiveTab(value)}
        >
          <Tab label='Warehouse' value={'Warehouse'} />
          <Tab label='Stock Setting' value={'Stock Setting'} />
        </Tabs>
        <TabPanel value={'Warehouse'} tabIndex={0}>
          Warehouse Content
        </TabPanel>
        <TabPanel
          value={'Stock Setting'}
          tabIndex={1}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <List
              sx={{
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                '& .MuiListItem-root': {
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: '150px 1fr'
                }
              }}
            >
              <ListItem
                sx={{
                  padding: 0
                }}
              >
                <InputLabel>Minimum Stock Alert</InputLabel>
                <CustomTextField
                  placeholder='Stock Alert'
                  value={state.minimumStockAlert}
                  onChange={e => onChangeState('minimumStockAlert', e.target.value)}
                />
              </ListItem>
              <ListItem
                sx={{
                  padding: 0
                }}
              >
                <InputLabel>Stock Update After</InputLabel>
                <CustomTextField
                  placeholder='Stock Alert'
                  value={state.stockUpdateAfter}
                  onChange={e => onChangeState('stockUpdateAfter', e.target.value)}
                />
              </ListItem>
              <ListItem
                sx={{
                  padding: 0
                }}
              >
                <InputLabel>Limited Status Stock</InputLabel>
                <CustomTextField
                  placeholder='Stock Alert'
                  value={state.limitedStatusStock}
                  onChange={e => onChangeState('limitedStatusStock', e.target.value)}
                />
              </ListItem>
            </List>
          </Box>
          <Box>
            <List
              sx={{
                padding: 0,
                margin: 0,
                '& .MuiListItem-root': {
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: '150px 1fr',
                  padding: 0,
                  margin: 0
                }
              }}
            >
              <ListItem>
                <Box />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Button variant='tonal' color='secondary'>
                    Cancel
                  </Button>
                  <Button type='submit' variant='contained'>
                    Save
                  </Button>
                </Box>
              </ListItem>
            </List>
          </Box>
        </TabPanel>
      </TabContext>
    </SettingViewLayout>
  )
}
export default StockSettingPage
