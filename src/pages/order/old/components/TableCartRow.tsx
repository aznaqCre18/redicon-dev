import { Icon } from '@iconify/react'
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material'
import clipboardCopy from 'clipboard-copy'
import React from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import ImagePreview from 'src/components/image/ImagePreview'
import { OrderFullDetailType } from 'src/types/apps/order'
import { formatPriceIDR } from 'src/utils/numberUtils'

const TableCartRow = ({ item }: { item: OrderFullDetailType }) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = React.useState(false)

  return (
    <>
      <Grid item xs={4} px={2}>
        {item.order_items.map((orderItem, index) => {
          if (index > 0 && !showAll) return null

          return (
            <Grid container key={index} spacing={2} columns={4}>
              <Grid item xs={3}>
                <Box key={index}>
                  <Box display={'flex'}>
                    <ImagePreview
                      avatar={
                        orderItem.product.media && orderItem.product.media.length > 0
                          ? orderItem.product.media[0]
                          : ''
                      }
                      fullName={orderItem.product_id ? orderItem.product.name : orderItem.name}
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
                          {orderItem.product
                            ? orderItem.product_variant
                              ? orderItem.product_variant.sku != ''
                                ? ' | VSKU: ' + orderItem.product_variant.sku
                                : ''
                              : ''
                            : '-'}
                        </Typography>
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
                  <Box display={'flex'} mt={2}>
                    {orderItem.note && (
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                          clipboardCopy(orderItem.note)
                          toast.success(t('Note copied'))
                        }}
                      >
                        Note : {orderItem.note}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={1}>
                <Typography variant='body1'>
                  {orderItem.discount > 0 ||
                  orderItem.discount_membership > 0 ||
                  orderItem.fix_tax > 0 ? (
                    <Tooltip
                      title={
                        <span>
                          {orderItem.discount > 0 && (
                            <>
                              {t('Discount')}: -
                              {formatPriceIDR(orderItem.discount / orderItem.quantity)}
                              <br />
                            </>
                          )}
                          {orderItem.discount_membership > 0 && (
                            <>
                              {t('Discount Member')}: -
                              {formatPriceIDR(orderItem.discount_membership)}
                              <br />
                            </>
                          )}
                          {orderItem.fix_tax > 0 && (
                            <>
                              {t('Fix Tax')}: +{formatPriceIDR(orderItem.fix_tax)}
                              <br />
                            </>
                          )}
                        </span>
                      }
                    >
                      <div>
                        <del>{formatPriceIDR(orderItem.price)}</del>
                        <br />
                        <span>
                          {formatPriceIDR(
                            orderItem.price -
                              orderItem.discount -
                              orderItem.discount_membership +
                              orderItem.fix_tax_per_item
                          )}
                        </span>
                      </div>
                    </Tooltip>
                  ) : (
                    formatPriceIDR(orderItem.total)
                  )}
                </Typography>
                x {orderItem.quantity}
                {orderItem.is_wholesale_price && (
                  <Typography
                    sx={{
                      ml: 2,
                      padding: '2px 4px',
                      backgroundColor: '#2196F3',
                      borderRadius: 0.4
                    }}
                    variant='caption'
                    color={'white'}
                    fontWeight={'bold'}
                  >
                    {t('Grosir')}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )
        })}
        {item.order_items.length > 1 && (
          <Box
            width={'100%'}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              '& :hover': {
                cursor: 'pointer',
                color: theme => theme.palette.primary.main
              }
            }}
          >
            <Typography
              variant='body2'
              fontSize={'0.8rem'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8
              }}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                'Tutup'
              ) : (
                <>
                  Total {item.order_items.length} Produk ( {item.order.item_qty} barang )
                </>
              )}
              <Icon
                icon={showAll ? 'akar-icons:chevron-up' : 'akar-icons:chevron-down'}
                fontSize={'0.8rem'}
              />
            </Typography>
          </Box>
        )}
      </Grid>
    </>
  )
}

export default TableCartRow
