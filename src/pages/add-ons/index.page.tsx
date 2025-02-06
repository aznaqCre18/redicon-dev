import { Card, Grid } from '@mui/material'
import React from 'react'
import AddOnItem from './components/AddOnItem'

const AddOns = () => {
  return (
    <Card
      sx={{
        mb: 10,
        p: 4,
        minHeight: '100%'
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={3}>
          <AddOnItem badgeNew />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
        <Grid item xs={3}>
          <AddOnItem />
        </Grid>
      </Grid>
    </Card>
  )
}

export default AddOns
