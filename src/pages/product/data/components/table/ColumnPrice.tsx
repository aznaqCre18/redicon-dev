import { Box, InputAdornment, TextField, Typography } from '@mui/material'
import React, { memo } from 'react'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import { PriceMembershipType, ProductDetailType } from 'src/types/apps/productType'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { CRUDPermission } from 'src/utils/permissionUtils'

type props = {
  level: number
  product: ProductDetailType
  permission: CRUDPermission
  setShowVariant: (id: number) => void
  onChangePrice: (id: number, price: PriceMembershipType) => void
  readonly?: boolean
}

const ColumnPrice = ({
  level,
  product,
  permission,
  setShowVariant,
  onChangePrice,
  readonly
}: props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {product.variants ? (
        <Typography
          variant='body2'
          className='hover-underline'
          sx={{ color: 'primary.main' }}
          onClick={() => setShowVariant(product.product.id)}
        >
          {formatPriceIDR(product.variants.map(a => a.price[level]).sort((a, b) => a - b)[0])}
          {formatPriceIDR(product.variants.map(a => a.price[level]).sort((a, b) => a - b)[0]) !=
            formatPriceIDR(product.variants.map(a => a.price[level]).sort((a, b) => b - a)[0]) && (
            <>
              {' - '}
              {formatPriceIDR(product.variants.map(a => a.price[level]).sort((a, b) => b - a)[0])}
            </>
          )}
        </Typography>
      ) : permission.update ? (
        <>
          {/* <TextFieldNumberOnBlur
          InputProps={{
            inputProps: {
              min: 0
            },
            startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
          }}
          size='small'
          readOnly={readonly}
          onBlur={value => {
            if (value != product.product.price[level]) {
              const price = product.product.price
              price[level] = value as number

              onChangePrice(product.product.id, price)
            }
          }}
          value={product.product.price[level]}
        /> */}
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatPriceIDR(product.product.price[level])}
          </Typography>
        </>
      ) : (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatPriceIDR(product.product.price[level])}
        </Typography>
      )}
    </Box>
  )
}

export default memo(ColumnPrice)
