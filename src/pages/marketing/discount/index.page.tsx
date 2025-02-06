import { Card, Grid } from '@mui/material'
import React from 'react'
import PromotionItem from './components/AddOnItem'

const Promotion = () => {
  const items = [
    { title: 'Product Discount', link: '/marketing/discount/product-discount' },
    { title: 'Voucher Discount' },
    { title: 'Free Shipping' },
    { title: 'Promo Bundling' },
    { title: 'Package Discount' },
    { title: 'Voucher Store' }
  ]

  return (
    <Card
      sx={{
        mb: 10,
        p: 4,
        minHeight: '100%'
      }}
    >
      <Grid container spacing={4}>
        {items.map((item, index) => (
          <Grid key={index} item xs={4}>
            <PromotionItem data={item} />
          </Grid>
        ))}
      </Grid>
    </Card>
  )
}

export default Promotion
