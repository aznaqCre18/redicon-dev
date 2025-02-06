import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PurchaseDetailItem } from 'src/types/apps/purchase/purchase'

const ProductNameColumn = ({ purchaseItem }: { purchaseItem: PurchaseDetailItem }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Box display={'flex'}>
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
            {purchaseItem.product_id ? purchaseItem.product.name : purchaseItem.name}
          </Typography>
          <Box display={'flex'} flexDirection={'column'}>
            <Typography variant='body2' color={'secondary'}>
              MSKU : {purchaseItem.product_id ? purchaseItem.product.sku : '-'}
              {purchaseItem.product
                ? purchaseItem.product_variant
                  ? purchaseItem.product_variant.sku != ''
                    ? ' | VSKU: ' + purchaseItem.product_variant.sku
                    : ''
                  : ''
                : '-'}
            </Typography>
            <Typography variant='body2' color={'secondary'}>
              {t('Variation')}:{' '}
              {purchaseItem.product &&
                (purchaseItem.product_variant && purchaseItem.product_variant.attributes
                  ? purchaseItem.product_variant.attributes
                      .map(attribute => attribute.value)
                      .join(' - ')
                  : '-')}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* <Box display={'flex'} mt={2} mb={2}>
        {purchaseItem.note && (
          <Button variant='outlined' size='small'>
            Note : {purchaseItem.note}
          </Button>
        )}
      </Box> */}
    </Box>
  )
}

export default ProductNameColumn
