import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import ImagePreview from 'src/components/image/ImagePreview'
import { OrderItemDetailType } from 'src/types/apps/order'

const ProductNameColumn = ({ orderItem }: { orderItem: OrderItemDetailType }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Box display={'flex'}>
        <ImagePreview
          avatar={
            orderItem.product.media && orderItem.product.media.length > 0
              ? orderItem.product.media[0]
              : ''
          }
          fullName={orderItem.product.name}
        />
        <Box>
          <Typography
            variant='body1'
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              lineHeight: '1rem',
              maxHeight: '2rem',
              mb: 1
            }}
          >
            {orderItem.product_id ? orderItem.product.name : orderItem.name}
          </Typography>
          <Box display={'flex'} flexDirection={'column'}>
            <Typography variant='body2' color={'secondary'}>
              MSKU : {orderItem.product_id ? orderItem.product.sku : '-'}
            </Typography>
            {orderItem.product &&
              orderItem.product_variant &&
              orderItem.product_variant.sku != '' && (
                <Typography variant='body2' color={'secondary'}>
                  {'VSKU: ' + orderItem.product_variant.sku}
                </Typography>
              )}
            <Typography variant='body2' color={'secondary'}>
              {t('Variation')}:{' '}
              {orderItem.product &&
                (orderItem.product_variant && orderItem.product_variant.attributes
                  ? orderItem.product_variant.attributes
                      .map(attribute => attribute.value)
                      .join(' - ')
                  : '-')}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box display={'flex'} mt={2} mb={2}>
        {orderItem.note && (
          <Button variant='outlined' size='small'>
            Note : {orderItem.note}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default ProductNameColumn
