import { Box, Divider, Tooltip, Typography } from '@mui/material'
import React, { memo } from 'react'
import { ProductDetailType } from 'src/types/apps/productType'
import useShowAllVariant from './ShowAllVariantAtom'

type props = {
  product: ProductDetailType
}
const ColumnSku = ({ product }: props) => {
  const { showAllVariantId } = useShowAllVariant()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {product.variants ? (
        (product.variants ?? []).map((variant, index) =>
          index < 3 ? (
            <div key={index}>
              <Tooltip title={variant.sku} placement='top'>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.primary' }}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                >
                  {variant.sku === '' ? '-' : variant.sku}
                </Typography>
              </Tooltip>
              <Divider />
            </div>
          ) : null
        )
      ) : (
        <Tooltip title={product.product.sku} placement='top'>
          <Typography
            variant='body2'
            sx={{ color: 'text.primary' }}
            overflow={'hidden'}
            textOverflow={'ellipsis'}
          >
            -
          </Typography>
        </Tooltip>
      )}
      {showAllVariantId == product.product.id && (
        <>
          {product.variants.map((variant, index) =>
            index >= 3 ? (
              <div key={index}>
                <Tooltip title={variant.sku} placement='top'>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.primary' }}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                  >
                    {variant.sku === '' ? '-' : variant.sku}
                  </Typography>
                </Tooltip>
                <Divider />
              </div>
            ) : null
          )}
        </>
      )}
    </Box>
  )
}

export default memo(ColumnSku)
