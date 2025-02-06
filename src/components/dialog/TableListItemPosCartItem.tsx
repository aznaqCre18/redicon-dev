import { Box, Divider, Grid } from '@mui/material'
import React from 'react'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { isEmptyReplace } from 'src/utils/stringUtils'
import { OrderCartDetailType } from 'src/types/apps/posOrder'

const GridSummary = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Grid container columns={2}>
    <Grid item xs={1} px={2} py={1} textAlign={'right'}>
      <div>{label}</div>
    </Grid>
    <Divider />
    <Grid
      item
      xs={1}
      px={2}
      py={1}
      sx={{
        borderLeft: '1px solid',
        borderColor: theme => theme.palette.divider
      }}
    >
      {value}
    </Grid>
  </Grid>
)

const TableListItemPosCartItem = ({ data }: { data?: OrderCartDetailType }) => {
  const { t } = useTranslation()

  const totalPrice =
    data?.order_cart_items.reduce(
      (acc, item) => acc + item.order_cart_item.price * item.order_cart_item.quantity,
      0
    ) ?? 0

  const totalItem =
    data?.order_cart_items.reduce((acc, item) => acc + item.order_cart_item.quantity, 0) ?? 0

  const items = data?.order_cart_items ?? []

  const grandDiscount = data?.order_cart.global_discount ?? 0

  return (
    <Box>
      <Grid
        container
        sx={{
          border: theme => '1px solid ' + theme.palette.divider,
          borderRadius: 1,
          mb: 2
        }}
      >
        <Grid
          py={2}
          item
          borderRadius={1}
          sx={theme => ({
            border: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: theme.palette.customColors.tableHeaderBg
          })}
          container
          alignItems={'center'}
          columns={13.4}
        >
          <Grid item xs={1} px={2}>
            {t('MSKU')}
          </Grid>
          <Grid item xs={1} px={2}>
            {t('VSKU')}
          </Grid>
          <Grid item xs={3.6} px={2} display={'flex'} alignItems={'center'}>
            <div>{t('Product Name')}</div>
          </Grid>
          <Grid item xs={1.4} px={2} display={'flex'} alignItems={'center'}>
            <div>{t('Variant')}</div>
          </Grid>
          <Grid item xs={0.8} px={2}>
            {t('Quantity')}
          </Grid>
          <Grid item xs={1.8} px={2}>
            @{t('Price')}
          </Grid>
          <Grid item xs={1.8} px={2}>
            @{t('Discount')}
          </Grid>
          <Grid item xs={2} px={2}>
            {t('Sub Total')}
          </Grid>
        </Grid>
        <Grid item width={'100%'}>
          {items.map((item, index) => {
            const productVariant = item.product_variant ? item.product_variant : null

            return (
              <Grid
                container
                alignItems={'top'}
                columns={13.4}
                key={index}
                py={2}
                sx={{
                  borderBottom: index == items.length - 1 ? undefined : '1px solid',
                  borderColor: theme => theme.palette.divider,
                  '&:hover': {
                    backgroundColor: theme => theme.palette.divider
                  }
                }}
              >
                <Grid item xs={1} px={2}>
                  {item.product.sku}
                </Grid>
                <Grid item xs={1} px={2}>
                  {isEmptyReplace(productVariant?.sku ?? '', '-')}
                </Grid>
                <Grid item xs={3.6} px={2} display={'flex'} alignItems={'center'}>
                  {item.product.name}
                </Grid>
                <Grid item xs={1.4} px={2}>
                  {productVariant && productVariant?.attributes
                    ? productVariant.attributes
                        .map((attribute: { value: string }) => attribute.value)
                        .join(' - ')
                    : '-'}
                </Grid>
                <Grid item xs={0.8} px={2}>
                  {formatNumber(item.order_cart_item.quantity)} {item.unit?.name ?? 'PCS'}
                </Grid>
                <Grid item xs={1.8} px={2}>
                  {formatPriceIDR(item.order_cart_item.price)}
                </Grid>
                <Grid item xs={1.8} px={2}>
                  {item.order_cart_item.discount && item.order_cart_item.discount > 0
                    ? item.order_cart_item.discount_type == 'percentage'
                      ? `${item.order_cart_item.discount}%`
                      : formatPriceIDR(item.order_cart_item.discount)
                    : '-'}
                </Grid>
                <Grid item xs={2} px={2}>
                  {formatPriceIDR(
                    (item.order_cart_item.price -
                      (item.order_cart_item.discount_type == 'percentage'
                        ? (item.order_cart_item.discount / 100) * item.order_cart_item.price
                        : item.order_cart_item.discount)) *
                      item.order_cart_item.quantity
                  )}
                </Grid>
              </Grid>
            )
          })}
        </Grid>
      </Grid>

      <Box display={'flex'} gap={2} justifyContent={'space-between'}>
        <Box minWidth={'400px'}></Box>
        <Box
          sx={theme => ({
            width: '400px',
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 1
          })}
        >
          <GridSummary
            label={`Sub Total (${totalItem} ${t('items')})`}
            value={formatPriceIDR(totalPrice)}
          />

          {/* ppn */}
          {(data?.order_cart.ppn ?? 0) > 0 && (
            <GridSummary label={t('Tax')} value={formatNumber(data?.order_cart.ppn ?? 0)} />
          )}

          {/* biaya layanan */}
          {(data?.order_cart.service_charge ?? 0) > 0 && (
            <GridSummary
              label={t('Service Charge')}
              value={formatNumber(data?.order_cart.service_charge ?? 0)}
            />
          )}

          <GridSummary label={t(`Global Discount`)} value={formatPriceIDR(grandDiscount)} />

          <GridSummary
            label={t(`Grand Total`)}
            value={formatPriceIDR(data?.order_cart.grand_total ?? 0)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default TableListItemPosCartItem
