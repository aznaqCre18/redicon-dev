import { Box, Divider, Grid } from '@mui/material'
import React from 'react'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { PurchaseDetailType } from 'src/types/apps/purchase/purchase'
import { terbilang } from 'src/utils/terbilang'
import { SaleDetailType } from 'src/types/apps/sale/sale'
import { ReturnPurchaseDetailType } from 'src/types/apps/purchase/returnPurchase'
import { ReturnSaleDetailType } from 'src/types/apps/sale/returnSale'
import { DialogDetailPurchaseInvoiceType } from './DialogDetailPurchaseInvoice'
import { RecapDetailType } from 'src/types/apps/recap/recap'
import { isEmptyReplace } from 'src/utils/stringUtils'

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

const TableListItemDetail = ({
  type,
  purchase,
  returnPurchase,
  sale,
  returnSale,
  recap
}: {
  type: DialogDetailPurchaseInvoiceType
  purchase?: PurchaseDetailType
  returnPurchase?: ReturnPurchaseDetailType
  sale?: SaleDetailType
  returnSale?: ReturnSaleDetailType
  recap?: RecapDetailType
}) => {
  const { t } = useTranslation()

  const totalPrice =
    type == 'purchase' && purchase
      ? purchase.purchase_items.reduce(
          (acc, item) => acc + (item.price - item.discount) * item.quantity,
          0
        )
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.purchase_items.reduce(
          (acc, item) => acc + (item.price - item.discount) * item.quantity,
          0
        )
      : type == 'sales' && sale
      ? sale.sales_details.reduce(
          (acc, item) => acc + (item.price - item.discount_per_item) * item.qty,
          0
        )
      : returnSale
      ? returnSale.return_sale_items.reduce(
          (acc, item) => acc + (item.price - item.discount) * item.quantity,
          0
        )
      : recap
      ? recap.recap_invoice_order_detail.reduce(
          (acc, item) =>
            acc +
            item.order_detail.reduce(
              (acc, item) =>
                acc +
                (item.price -
                  (item.discount ? item.discount / item.quantity : item.discount_per_item) -
                  (item as any).discount_membership) *
                  item.quantity,
              0
            ),
          0
        )
      : 0

  const totalItem =
    type == 'purchase' && purchase
      ? purchase.purchase_items.reduce((acc, item) => acc + item.quantity, 0)
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.purchase_items.reduce((acc, item) => acc + item.quantity, 0)
      : type == 'sales' && sale
      ? sale.sales_details.reduce((acc, item) => acc + item.qty, 0)
      : returnSale
      ? returnSale.return_sale_items.reduce((acc, item) => acc + item.quantity, 0)
      : recap
      ? recap.recap_invoice_order_detail.reduce(
          (acc, item) => acc + item.order_detail.reduce((acc, item) => acc + item.quantity, 0),
          0
        )
      : 0

  const totalWeight =
    type == 'purchase' && purchase
      ? purchase.purchase_items.reduce((acc, item) => acc + item.product.weight * item.quantity, 0)
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.purchase_items.reduce(
          (acc, item) => acc + item.product.weight * item.quantity,
          0
        )
      : type == 'sales' && sale
      ? sale.sales_details.reduce((acc, item) => acc + item.product.weight * item.qty, 0)
      : returnSale
      ? returnSale.return_sale_items.reduce(
          (acc, item) => acc + item.product.weight * item.quantity,
          0
        )
      : recap
      ? recap.recap_invoice_order_detail.reduce(
          (acc, item) =>
            acc +
            item.order_detail.reduce((acc, item) => acc + item.product.weight * item.quantity, 0),
          0
        )
      : 0

  const items =
    type == 'purchase' && purchase
      ? purchase.purchase_items
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.purchase_items
      : type == 'sales' && sale
      ? sale.sales_details
      : returnSale
      ? returnSale.return_sale_items
      : recap
      ? recap.recap_invoice_order_detail.reduce(
          (acc, item) =>
            acc.concat(
              item.order_detail.map(item2 => ({ ...item2, order_number: item.order.order_number }))
            ),
          [] as any[]
        )
      : []

  const paymentMethod =
    type == 'purchase' && purchase
      ? purchase.payment_method
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.payment_method
      : type == 'sales' && sale
      ? sale.sales.payment_method
      : returnSale
      ? returnSale.payment_method
      : recap
      ? recap.payment_method
      : ''

  const grandDiscount =
    type == 'purchase' && purchase
      ? purchase.grand_discount
      : type == 'purchase_return' && returnPurchase
      ? returnPurchase.grand_discount
      : type == 'sales' && sale
      ? sale.sales.global_discount
      : returnSale
      ? returnSale.grand_discount
      : recap
      ? recap.global_discount || 0
      : 0

  const terbilangText =
    totalPrice - grandDiscount > 0 ? terbilang(totalPrice - grandDiscount) : 'Nol'

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
          columns={type == 'recap' ? 16.8 : 13.3}
        >
          {type == 'recap' && (
            <Grid item xs={1.5} px={2}>
              Order ID
            </Grid>
          )}
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
          <Grid item xs={0.7} px={2}>
            {t('Quantity')}
          </Grid>
          <Grid item xs={1.8} px={2}>
            @{t('Price')}
          </Grid>
          <Grid item xs={1.8} px={2}>
            @{t('Discount')}
          </Grid>
          {type == 'recap' && (
            <Grid item xs={2} px={2}>
              @{t('Discount')} Member
            </Grid>
          )}
          <Grid item xs={2} px={2}>
            {t('Sub Total')}
          </Grid>
        </Grid>
        <Grid item width={'100%'}>
          {items.map((item, index) => {
            const itemAny = item as any
            const productVariant =
              type == 'purchase' && purchase
                ? itemAny.product_variant
                : type == 'purchase_return' && returnPurchase
                ? itemAny.product_variant
                : type == 'sales' && sale
                ? itemAny.variant
                : returnSale
                ? itemAny.product_variant
                : recap
                ? itemAny.product_variant
                : null

            return (
              <Grid
                container
                alignItems={'top'}
                columns={type == 'recap' ? 16.8 : 13.3}
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
                {type == 'recap' && (
                  <Grid item xs={1.5} px={2}>
                    {item.order_number}
                  </Grid>
                )}
                <Grid item xs={1} px={2}>
                  {item.product.sku}
                </Grid>
                <Grid item xs={1} px={2}>
                  {isEmptyReplace(productVariant?.sku, '-')}
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
                <Grid item xs={0.7} px={2}>
                  {formatNumber(itemAny.quantity || itemAny.qty)} {item.product.unit?.name}
                </Grid>
                <Grid item xs={1.8} px={2}>
                  {formatPriceIDR(item.price)}
                </Grid>
                <Grid item xs={1.8} px={2}>
                  {type == 'recap' ? (
                    <>
                      {itemAny.discount / (itemAny.quantity || itemAny.qty) > 0
                        ? formatPriceIDR(itemAny.discount / (itemAny.quantity || itemAny.qty))
                        : '-'}
                    </>
                  ) : (
                    <>
                      {(itemAny.discount_per_item ?? itemAny.discount ?? 0) > 0
                        ? formatPriceIDR(itemAny.discount_per_item ?? itemAny.discount ?? 0)
                        : '-'}
                    </>
                  )}
                </Grid>
                {type == 'recap' && (
                  <Grid item xs={2} px={2}>
                    {(item.discount_membership ?? 0) > 0
                      ? formatPriceIDR(item.discount_membership)
                      : '-'}
                  </Grid>
                )}
                <Grid item xs={2} px={2}>
                  {type == 'recap' ? (
                    <>
                      {formatPriceIDR(
                        (item.price -
                          (itemAny.discount
                            ? itemAny.discount / (itemAny.quantity || itemAny.qty)
                            : itemAny.discount_per_item ?? 0) -
                          itemAny.discount_membership) *
                          (itemAny.quantity || itemAny.qty)
                      )}
                    </>
                  ) : (
                    <>
                      {formatPriceIDR(
                        (item.price - (itemAny.discount_per_item ?? itemAny.discount ?? 0)) *
                          (itemAny.quantity || itemAny.qty)
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            )
          })}
        </Grid>
      </Grid>

      <Box display={'flex'} gap={2} justifyContent={'space-between'}>
        <Box minWidth={'400px'}>
          <table>
            <tr>
              <td>{t('Payment Method')}</td>
              <td>: {paymentMethod}</td>
            </tr>
            <tr>
              <td>{t('Spelled Out')}</td>
              <td>: {terbilangText} rupiah</td>
            </tr>
          </table>
        </Box>
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
          <GridSummary label={t(`Total Weight`)} value={`${formatNumber(totalWeight)} gram`} />

          <GridSummary label={t(`Global Discount`)} value={formatPriceIDR(grandDiscount)} />

          <GridSummary
            label={t(`Grand Total`)}
            value={formatPriceIDR(totalPrice - grandDiscount)}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default TableListItemDetail
