import { Icon } from '@iconify/react'
import { Grid, IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'
import React, { memo } from 'react'
import { ProductDetailType } from 'src/types/apps/productType'
import { CRUDPermission } from 'src/utils/permissionUtils'
import MenuOptionAction from '../MenuOptionAction'
import { useTranslation } from 'react-i18next'

type props = {
  product: ProductDetailType
  permission: CRUDPermission
  handleDelete: (id: number) => void
}

const ColumnAction = ({ product, permission, handleDelete }: props) => {
  const { t } = useTranslation()

  return (
    <Grid container justifyContent={'right'}>
      {permission.update && (
        <Grid item>
          <Tooltip title={t('Edit')} placement='top'>
            <IconButton
              component={Link}
              href={`/product/edit/${product.product.id}`}
              size='small'
              sx={{ marginLeft: '5px' }}
            >
              <Icon icon='iconamoon:edit-light' fontSize='0.875rem' />
            </IconButton>
          </Tooltip>
        </Grid>
      )}

      {permission.delete && (
        <Grid item>
          <Tooltip title={t('Delete')} placement='top'>
            <IconButton
              size='small'
              sx={{ marginLeft: '5px' }}
              onClick={() => handleDelete(product.product.id)}
            >
              <Icon icon='mi:delete' fontSize='0.875rem' />
            </IconButton>
          </Tooltip>
        </Grid>
      )}

      {/* <Grid item>
        <Tooltip title={t('Duplicate')} placement='bottom'>
          <Link href={`/product/data/add/${product.product.id}`} target='_blank'>
            <IconButton size='small' sx={{ marginLeft: '5px' }}>
              <Icon icon='octicon:copy-24' fontSize='0.875rem' />
            </IconButton>
          </Link>
        </Tooltip>
      </Grid> */}
      {/* <Grid item>
        <MenuOptionAction product={product} />
      </Grid> */}
    </Grid>
  )
}

export default memo(ColumnAction)
