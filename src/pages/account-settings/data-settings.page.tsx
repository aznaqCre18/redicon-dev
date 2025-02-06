import React from 'react'
import AccountViewLayout from './components/AccountViewLayout'
import { Alert, Box, Button, Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'

const modules: string[] = [
  'Order',
  'Product',
  'Stock',
  'Customer',
  'Purchase',
  'Invoice',
  'Setting'
]

const modules2: string[] = ['Data Product', 'Data Category', 'Data Brand', 'Data Unit']

const Page = () => {
  return (
    <AccountViewLayout tab='account-data-settings'>
      <div style={{ padding: '32px' }}>
        <Alert severity='error'>
          Alert!!! deleting data will remove all transactions, products, product categories, and
          product brands.
        </Alert>
        <Grid container marginTop={2} spacing={2}>
          <Grid item xs={6}>
            <Box border={1} borderColor='#E8E8E8' paddingX={2} height={'100%'}>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label='All Module' />
                {modules.map((module, index) => (
                  <div key={index}>
                    <FormControlLabel control={<Checkbox />} label={module} />
                  </div>
                ))}
              </FormGroup>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box border={1} borderColor='#E8E8E8' paddingX={2} height={'100%'}>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label='All Module' />
                {modules2.map((module, index) => (
                  <div key={index}>
                    <FormControlLabel control={<Checkbox />} label={module} />
                  </div>
                ))}
              </FormGroup>
            </Box>
          </Grid>
        </Grid>
        <Box mt={8} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant='tonal' color='secondary' sx={{ mr: 3 }}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='error'>
            Delete
          </Button>
        </Box>
      </div>
    </AccountViewLayout>
  )
}

export default Page
