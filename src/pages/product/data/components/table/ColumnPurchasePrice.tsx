import { Box, InputAdornment, Typography } from '@mui/material'
import React, { memo } from 'react'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import { ProductDetailType } from 'src/types/apps/productType'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { CRUDPermission } from 'src/utils/permissionUtils'

type props = {
  product: ProductDetailType
  permission: CRUDPermission
  onChangePurchasePrice: (id: number, purchase_price: number) => void
}

const ColumnPurchasePrice = ({ product, permission, onChangePurchasePrice }: props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {permission.update ? (
        <TextFieldNumberOnBlur
          InputProps={{
            inputProps: {
              min: 0
            },
            startAdornment: <InputAdornment position='start'>Rp</InputAdornment>
          }}
          size='small'
          onBlur={value => {
            const purchase_price = product.product.purchase_price
            const valueNumber = Number(value)
            if (valueNumber != purchase_price) {
              onChangePurchasePrice(product.product.id, valueNumber)
            }
          }}
          value={product.product.purchase_price}
        />
      ) : (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatPriceIDR(product.product.purchase_price)}
        </Typography>
      )}
    </Box>
  )
}

export default memo(ColumnPurchasePrice)
