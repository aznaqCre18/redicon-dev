import { Icon } from '@iconify/react'
import { Box, Button, Grid, TextField, Tooltip, Typography } from '@mui/material'
import clipboardCopy from 'clipboard-copy'
import React, { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import ImagePreview from 'src/components/image/ImagePreview'
import { OrderDetailV2, OrderStatusType } from 'src/types/apps/order'
import { formatDate } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'

const TableCartRow = ({
  item,
  tabValue,
  handlePickdate
}: {
  item: OrderDetailV2
  tabValue: OrderStatusType
  handlePickdate?: (item: OrderDetailV2, index?: number) => void
}) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = React.useState(false)

  const isAckAppProc = useMemo(
    () =>
      tabValue == 'PRE DELIVERY' ||
      'ACKNOWLEDGMENT' ||
      tabValue == 'APPROVED' ||
      tabValue == 'ON PROCESS' ||
      tabValue == 'CANCELED',
    [tabValue]
  )

  const notAckAppProc = useMemo(
    () =>
      tabValue !== 'PRE DELIVERY' &&
      tabValue !== 'ACKNOWLEDGMENT' &&
      tabValue !== 'APPROVED' &&
      tabValue !== 'ON PROCESS' &&
      tabValue !== 'CANCELED',
    [tabValue]
  )

  function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const renderItemStatus = (index: number) => {
    const obj: { [key: number]: string } = {
      0: 'Approved',
      1: 'Acknowledgedment'
    }

    return (
      <Grid container display={'flex'} flexDirection={'column'} item xs={2} spacing={2}>
        <Grid item>
          <ul
            style={{
              listStyleType: 'none',
              marginInline: 0,
              marginBlock: 0,
              paddingInline: 0
            }}
          >
            <li>
              <Box
                sx={{ color: index !== 1 || tabValue == 'APPROVED' ? 'unset' : '#fe9f43' }}
                display={'flex'}
                alignItems={'center'}
                gap={1}
              >
                <Icon
                  icon='lets-icons:check-fill'
                  fontSize={18}
                  color={index !== 1 || tabValue == 'APPROVED' ? 'green' : 'currentColor'}
                />
                {tabValue == 'APPROVED' ? 'Approved' : obj[index]}
              </Box>
            </li>
          </ul>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Grid item xs={isAckAppProc ? 9.5 : 4} px={2}>
        {item.order_items.map((orderItem, index) => {
          if (index > 0 && !showAll) return null

          return (
            <Grid container key={index} spacing={2} columns={4}>
              <Grid item xs={isAckAppProc ? 1.2 : 3}>
                <Box key={index}>
                  <Box display={'flex'}>
                    <ImagePreview
                      avatar={
                        orderItem.product_media && orderItem.product_media.length > 0
                          ? orderItem.product_media[0]
                          : ''
                      }
                      fullName={orderItem.product_name ? orderItem.product_name : orderItem.name}
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
                        {orderItem.product_name ? orderItem.product_name : orderItem.name}
                      </Typography>
                      <Box display={'flex'} flexDirection={'column'}>
                        <Typography variant='body2' color={'secondary'}>
                          MSKU : {orderItem.product_name ? orderItem.product_sku : '-'}
                          {orderItem.product_name
                            ? orderItem.product_variant_attributes
                              ? orderItem.product_variant_sku != ''
                                ? ' | VSKU: ' + orderItem.product_variant_sku
                                : ''
                              : ''
                            : '-'}
                        </Typography>
                        <Typography variant='body2' color={'secondary'}>
                          {t('Variation')}:{' '}
                          {orderItem.product_name &&
                            (orderItem.product_variant_attributes &&
                            orderItem.product_variant_attributes
                              ? orderItem.product_variant_attributes
                                  .map(attribute => attribute.value)
                                  .join(' - ')
                              : '-')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box display={'flex'} mt={2} mb={item.order_items.length > 1 ? 2 : undefined}>
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
              {(tabValue == 'PRE DELIVERY' || isAckAppProc) && (
                <>
                  <Grid item xs={0.3}>
                    100
                  </Grid>
                  {/* {tabValue == 'PRE DELIVERY' && (
                    <Grid item xs={0.8}>
                      <TextField sx={{ mr: 1 }} size='small' type='number' />
                    </Grid>
                  )} */}
                </>
              )}
              <Grid
                item
                xs={tabValue == 'PRE DELIVERY' || isAckAppProc ? 0.6 : 1}
                sx={
                  {
                    // ...(tabValue == 'PRE DELIVERY' ? { paddingLeft: '3rem !important' } : {})
                  }
                }
              >
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
                              orderItem.fix_tax
                          )}
                        </span>
                      </div>
                    </Tooltip>
                  ) : notAckAppProc ? (
                    formatPriceIDR(orderItem.total)
                  ) : null}
                </Typography>
                {notAckAppProc && <>x {orderItem.quantity}</>}
                {isAckAppProc && formatPriceIDR(orderItem.price)}
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
              {isAckAppProc && (
                <>
                  <Grid item xs={0.6}>
                    <Tooltip
                      title={
                        <span>
                          Total:{' '}
                          {formatPriceIDR(
                            item.order_items.map(i => i.total).reduce((a, b) => a + b, 0)
                          )}
                          {item.order.shipping_cost > 0 && (
                            <>
                              <br />
                              {t('Shipping Cost')}: +{formatPriceIDR(item.order.shipping_cost)}
                            </>
                          )}
                          {(item.order.shipping_tax ?? 0) > 0 && (
                            <>
                              <br />
                              {t('Shipping Tax')}: +{formatPriceIDR(item.order.shipping_tax ?? 0)}
                            </>
                          )}
                          {item.order.tax > 0 && (
                            <>
                              <br />
                              {t('Tax')}: +{formatPriceIDR(item.order.tax)}
                            </>
                          )}
                          {item.order.service_charges_mdr > 0 && (
                            <>
                              <br />
                              {t('Service Charge')}: +
                              {formatPriceIDR(item.order.service_charges_mdr)}
                            </>
                          )}
                          {item.order.global_discount > 0 && (
                            <>
                              <br />
                              Global {t('Discount')}: -{formatPriceIDR(item.order.global_discount)}
                            </>
                          )}
                          {item.order.global_discount_recap > 0 && (
                            <>
                              <br />
                              Global {t('Discount')}: -
                              {formatPriceIDR(item.order.global_discount_recap)}
                            </>
                          )}
                        </span>
                      }
                      placement='top'
                    >
                      <Typography variant='body1'>
                        {formatPriceIDR(item.order.grand_total)}
                      </Typography>
                    </Tooltip>
                    {notAckAppProc && (
                      <Box display={'flex'}>
                        <Box
                          paddingRight={1}
                          paddingLeft={1}
                          border={1}
                          borderRadius={'0.2rem'}
                          sx={theme => ({
                            borderColor: theme.palette.divider
                          })}
                        >
                          <Typography variant='body2'>{item.order.item_qty} Pcs</Typography>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={0.6}>
                    {isAckAppProc ? (
                      <Typography
                        className='hover-underline'
                        variant='body1'
                        onClick={() => handlePickdate?.(item, index)}
                        sx={{
                          color: '#fe9f43',
                          fontWeight: 600
                        }}
                      >
                        Delivery Date
                      </Typography>
                    ) : (
                      formatDate(new Date().getDate())
                    )}
                  </Grid>
                  {renderItemStatus(getRandomNumber(0, 1) as number)}
                </>
              )}
            </Grid>
          )
        })}
        {item.order_items.length > 1 && (
          <Box
            width={isAckAppProc ? '50%' : '100%'}
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
