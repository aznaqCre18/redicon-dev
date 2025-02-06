import { Box, Divider, Grid, Tooltip } from '@mui/material'
import React from 'react'
import { OrderFullDetailType } from 'src/types/apps/order'
import ProductNameColumn from './ProductNameColumn'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { getTotalPriceItem, getTotalPriceOrder } from 'src/utils/orderUtils'
import { formatDate } from 'src/utils/dateUtils'

const GridSummary = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Grid container columns={4}>
    <Grid item xs={3} px={2} py={1} textAlign={'right'}>
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

const TableDetailOrder = ({ order }: { order: OrderFullDetailType }) => {
  const { t } = useTranslation()
  const totalPrice = getTotalPriceOrder(order.order_items)
  const totalWeight = (order.order_items ?? []).reduce(
    (acc, item) => acc + item.product.weight * item.quantity,
    0
  )

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
          columns={7}
        >
          <Grid item xs={2.5} px={2} display={'flex'} alignItems={'center'}>
            <div>{t('Product Name')}</div>
          </Grid>
          <Grid item xs={1} px={2}>
            {t('Quantity')}
          </Grid>
          <Grid item xs={1} px={2}>
            {t('Unit Price')}
          </Grid>
          <Grid item xs={1} px={2}>
            {t('Total')}
            {/* @{t('Fix Tax')} */}
          </Grid>
          {/* <Grid item xs={1} px={2}>
            @{t('Discount')} Member
          </Grid> */}
          <Grid item xs={1} px={2}>
            Acknowledgement
          </Grid>
        </Grid>
        <Grid item width={'100%'}>
          {(order.order_items ?? []).map((item, index) => (
            <Grid
              container
              alignItems={'top'}
              columns={7}
              key={index}
              pt={2}
              sx={{
                borderBottom: index == order.order_items.length - 1 ? undefined : '1px solid',
                borderColor: theme => theme.palette.divider,
                '&:hover': {
                  backgroundColor: theme => theme.palette.divider
                }
              }}
            >
              <Grid item xs={2.5} px={2} display={'flex'} alignItems={'center'}>
                <ProductNameColumn orderItem={item} />
              </Grid>
              <Grid item xs={1} px={2}>
                {formatNumber(item.quantity)}
              </Grid>
              <Grid item xs={1} px={2}>
                {item.discount_per_item > 0 ? (
                  <>
                    <Tooltip
                      placement='top'
                      title={
                        <span>
                          {t('Discount')}: {formatPriceIDR(item.discount_per_item)}
                        </span>
                      }
                    >
                      <div>
                        <del>{formatPriceIDR(item.price)}</del>
                        <br />
                        <span>{formatPriceIDR(item.price - item.discount_per_item)}</span>
                      </div>
                    </Tooltip>
                  </>
                ) : (
                  formatPriceIDR(item.price)
                )}
              </Grid>
              <Grid item xs={1} px={2}>
                {formatPriceIDR(getTotalPriceItem(item))}
                {/* {item.fix_tax > 0 ? formatPriceIDR(item.fix_tax) : '-'} */}
              </Grid>
              {/* <Grid item xs={1} px={2}>
                {item.discount_membership > 0 ? formatPriceIDR(item.discount_membership) : '-'}
              </Grid> */}
              <Grid item xs={1} px={2}>
                {formatDate(new Date().getDate())}
                {/* {formatPriceIDR(getTotalPriceItem(item))} */}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Box
        sx={theme => ({
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 1
        })}
      >
        <GridSummary
          label={`Total (${order.order.item_qty} ${t('items')})`}
          value={formatPriceIDR(totalPrice)}
        />
        <GridSummary label={t(`Total Weight`)} value={`${formatNumber(totalWeight)} gram`} />
        {/* <GridSummary
          label={t(`Shipping Fee`)}
          value={order.order.shipping_cost > 0 ? formatPriceIDR(order.order.shipping_cost) : '-'}
        /> */}
        {(order.order.shipping_tax ?? 0) > 0 && (
          <GridSummary
            label={t(`Shipping Tax`)}
            value={formatPriceIDR(order.order.shipping_tax ?? 0)}
          />
        )}
        {(order.order.tax ?? 0) > 0 ||
          ((order.order.ppn ?? 0) > 0 && (
            <GridSummary
              label={
                t(`Tax`) +
                (order.order.ppn_percentage > 0 ? ` (${order.order.ppn_percentage}%)` : '')
              }
              value={formatPriceIDR((order.order.tax ?? 0) + order.order.ppn ?? 0)}
            />
          ))}
        {(order.order.service_charges_mdr ?? 0) > 0 && (
          <GridSummary
            label={t(`Service Charge`)}
            value={formatPriceIDR(order.order.service_charges_mdr ?? 0)}
          />
        )}
        {/* <GridSummary
          label={t(`Global Discount`)}
          value={
            order.order.global_discount_recap > 0 || order.order.global_discount > 0
              ? ' - ' +
                formatPriceIDR(order.order.global_discount_recap || order.order.global_discount)
              : '-'
          }
        /> */}
        <GridSummary label={t(`Grand Total`)} value={formatPriceIDR(order.order.grand_total)} />
      </Box>
    </Box>
  )
}

export default TableDetailOrder
