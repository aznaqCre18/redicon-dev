import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import React, { memo } from 'react'
import ImagePreview from 'src/components/image/ImagePreview'
import { ProductDetailType } from 'src/types/apps/productType'
import { getTypeVideoOrImageFromFileName } from 'src/utils/fileUtils'
import { CRUDPermission } from 'src/utils/permissionUtils'

type props = {
  product: ProductDetailType
  permission: CRUDPermission
  showImage: boolean
}

const ColumnProduct = ({ product, permission, showImage = true }: props) => {
  const mediaImages = (product.product.media ?? []).filter(
    item => getTypeVideoOrImageFromFileName(item) == 'image'
  )
  const mediaVideo = (product.product.media ?? []).filter(
    item => getTypeVideoOrImageFromFileName(item) == 'video'
  )

  // console.log('mediaVideo', mediaVideo)

  return (
    <Box sx={{ display: 'flex', alignItems: 'start' }}>
      {showImage && (
        <ImagePreview
          hasVideo={product.product.has_video}
          avatar={
            mediaVideo.length > 0 ? mediaVideo[0] : mediaImages.length > 0 ? mediaImages[0] : ''
          }
          fullName={product.product.name}
          badge={product.product.labels}
          discount={
            product.product.discount_type == 'percentage'
              ? product.product.discount
              : product.product.discount && product.product.price[1]
              ? Math.round((product.product.discount / product.product.price[1]) * 100)
              : 0
          }
          discountType={product.product.discount_type}
          // badge={
          //   params.api.getRowIndexRelativeToVisibleRows(params.row.product.id) < 5 ? 'Terbaru' : ''
          // }
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {permission.update ? (
          <Typography
            className='hover-underline'
            component={Link}
            href={`/product/edit/${product.product.id}`}
            title={product.product.name}
            variant='body2'
            sx={{
              fontWeight: 600,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'primary.main'
            }}
          >
            {product.product.name}
          </Typography>
        ) : (
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.product.name}
          </Typography>
        )}

        <Typography variant='caption'>MID: {product.product.sku}</Typography>
      </Box>
    </Box>
  )
}

export default memo(ColumnProduct)
