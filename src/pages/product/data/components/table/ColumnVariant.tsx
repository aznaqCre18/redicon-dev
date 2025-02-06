import { Box, Divider, Tooltip, Typography } from '@mui/material'
import React, { memo } from 'react'
import { ProductDetailType } from 'src/types/apps/productType'
import useShowAllVariant from './ShowAllVariantAtom'
import { useTranslation } from 'react-i18next'

type props = {
  product: ProductDetailType
}

const ColumnVariant = ({ product }: props) => {
  const { t } = useTranslation()
  const { showAllVariantId, setShowAllVariantId } = useShowAllVariant()

  return (
    <Box width={'100%'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {product.variants ? (
          (product.variants ?? []).map((variant, index) =>
            index < 3 ? (
              <div key={index}>
                <Tooltip
                  title={variant.attributes.map(attribute => attribute.value).join(' - ')}
                  placement='top'
                >
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.primary',
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px'
                    }}
                  >
                    {variant.attributes.map(attribute => attribute.value).join(' - ')}
                  </Typography>
                </Tooltip>
                <Divider />
              </div>
            ) : null
          )
        ) : (
          <>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              -
            </Typography>
          </>
        )}
        {showAllVariantId == product.product.id && (
          <>
            {(product.variants ?? []).map((variant, index) =>
              index >= 3 ? (
                <div key={index}>
                  <Tooltip
                    title={variant.attributes.map(attribute => attribute.value).join(' - ')}
                    placement='top'
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.primary',
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px'
                      }}
                    >
                      {variant.attributes.map(attribute => attribute.value).join(' - ')}
                    </Typography>
                  </Tooltip>
                  <Divider />
                </div>
              ) : null
            )}
          </>
        )}
      </Box>
      {product.variants && product.variants.length > 3 && (
        <Box mt={2}>
          <Typography
            noWrap
            variant='body2'
            color={'secondary'}
            sx={theme => ({
              ':hover': {
                color: theme.palette.primary.main,
                cursor: 'pointer'
              }
            })}
            onClick={() => setShowAllVariantId(product.product.id)}
          >
            {showAllVariantId != product.product.id &&
              `${t('Tampilkan Semua')} (${product.variants.length})`}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default memo(ColumnVariant)
