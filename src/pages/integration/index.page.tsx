import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

// ** Data Import
import { Grid, Tab } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { integrationService } from 'src/services/integration'
import { useMutation } from 'react-query'
import { errorType } from 'src/types/apps/errorType'
import toast from 'react-hot-toast'
import IntegrationButtonItem, {
  IntegrationButtonItemProps
} from './components/IntegrationButtonItem'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { useState } from 'react'
import { SyntheticEvent } from 'react-draft-wysiwyg'
import StoreTable from './components/StoreTable'

const Integration = () => {
  // ** States
  const theme = useTheme()

  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const getLinkMutation = useMutation(integrationService.getUrlShopee, {
    onSuccess: response => {
      window.open(response.data.data)
    },
    onError: (err: errorType) => {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response?.data?.message)
      }
    }
  })

  const marketPlaceItem: IntegrationButtonItemProps[] = [
    {
      onClick: () => {
        getLinkMutation.mutate()
      },
      src: '/images/icons/shopee_icon.jpeg',
      label: 'Shopee'
    },
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/tokopedia_icon.png',
      label: 'Tokopedia'
    },
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/tiktok_icon.png',
      label: 'Tiktok'
    },
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/lazada_icon.png',
      label: 'Lazada'
    },
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/bukalapak_icon.png',
      label: 'Bukalapak'
    }
  ]

  const webStoreItem: IntegrationButtonItemProps[] = [
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/shopify_icon.png',
      label: 'Shopify'
    }
  ]

  const foodOnlineItem: IntegrationButtonItemProps[] = [
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/grab_icon.png',
      label: 'Grab'
    }
  ]

  const systemPosItem: IntegrationButtonItemProps[] = [
    {
      onClick: () => {
        // getLinkMutation.mutate()
      },
      src: '/images/icons/moka_icon.png',
      label: 'Moka POS'
    }
  ]

  return (
    <Card>
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label='simple tabs example'>
          <Tab value='1' label='Integration' />
          <Tab value='2' label='Tab Store Listings' />
        </TabList>
        <TabPanel value='1'>
          <div
            style={{
              padding: theme.spacing(5)
            }}
          >
            <Typography variant='h5' marginBottom={2}>
              Marketplace
            </Typography>
            <Grid container spacing={6} columns={{ xs: 2, sm: 4, md: 5 }}>
              {marketPlaceItem.map((item, index) => (
                <Grid item xs={1} key={index}>
                  <IntegrationButtonItem {...item} />
                </Grid>
              ))}
            </Grid>
          </div>
          <div
            style={{
              padding: theme.spacing(5)
            }}
          >
            <Typography variant='h5' marginBottom={2}>
              Web Store
            </Typography>
            <Grid container spacing={6} columns={{ xs: 2, sm: 4, md: 5 }}>
              {webStoreItem.map((item, index) => (
                <Grid item xs={1} key={index}>
                  <IntegrationButtonItem {...item} />
                </Grid>
              ))}
            </Grid>
          </div>
          <div
            style={{
              padding: theme.spacing(5)
            }}
          >
            <Typography variant='h5' marginBottom={2}>
              Food Order
            </Typography>
            <Grid container spacing={6} columns={{ xs: 2, sm: 4, md: 5 }}>
              {foodOnlineItem.map((item, index) => (
                <Grid item xs={1} key={index}>
                  <IntegrationButtonItem {...item} />
                </Grid>
              ))}
            </Grid>
          </div>
          <div
            style={{
              padding: theme.spacing(5)
            }}
          >
            <Typography variant='h5' marginBottom={2}>
              POS
            </Typography>
            <Grid container spacing={6} columns={{ xs: 2, sm: 4, md: 5 }}>
              {systemPosItem.map((item, index) => (
                <Grid item xs={1} key={index}>
                  <IntegrationButtonItem {...item} />
                </Grid>
              ))}
            </Grid>
          </div>
        </TabPanel>
        <TabPanel value='2'>
          <StoreTable />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default Integration
