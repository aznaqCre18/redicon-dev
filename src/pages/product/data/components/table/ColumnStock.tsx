import { Icon } from '@iconify/react'
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TextFieldNumberOnBlur from 'src/components/form/TextFieldNumberOnBlur'
import { ProductDetailType } from 'src/types/apps/productType'
import { formatNumber } from 'src/utils/numberUtils'
import { CRUDPermission } from 'src/utils/permissionUtils'

type props = {
  product: ProductDetailType
  permission: CRUDPermission
  setShowVariant: (id: number) => void
  onChangeStock: (id: number, stock: number) => void
}

const ColumnStock = ({ product, permission, setShowVariant, onChangeStock }: props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {product.variants ? (
        <Typography
          variant='body2'
          className='hover-underline'
          sx={{ color: 'primary.main' }}
          onClick={() => setShowVariant(product.product.id)}
        >
          {formatNumber(product.variants.map(a => a.stock).reduce((a, b) => a + b, 0))}
          <IconButton
            size='small'
            sx={{
              '&.MuiIconButton-root': {
                padding: '0 !important',
                paddingLeft: '4px !important'
              }
            }}
            onClick={() => setShowVariant(product.product.id)}
          >
            <Icon icon='iconamoon:edit-light' fontSize={12} />
          </IconButton>
        </Typography>
      ) : permission.update ? (
        <>
          {/* <Tooltip
            title={product.product.product_type == 'NONSTOCK' ? t('Non Stock') : ''}
            placement='top'
          >
            <TextFieldNumberOnBlur
              disabled={product.product.product_type == 'NONSTOCK'}
              InputProps={{
                inputProps: {
                  min: 0
                }
              }}
              onBlur={value => {
                if (value != product.product.stock) onChangeStock(product.product.id, value as number)
              }}
              size='small'
              value={product.product.stock}
            />
          </Tooltip> */}
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatNumber(product.product.stock)}
          </Typography>
        </>
      ) : (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatNumber(product.product.stock)}
        </Typography>
      )}

      {/* {product.product.product_type == 'NONSTOCK' && (
        <div>
          <Chip
            color={'success'}
            label={'Non ' + t('Stock')}
            size='small'
            sx={{
              fontWeight: 'bold'
            }}
          />
        </div>
      )} */}
    </Box>
  )
}

export default ColumnStock
