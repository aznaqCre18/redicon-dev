import React from 'react'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { PurchaseDetailType } from 'src/types/apps/purchase/purchase'
import { terbilang } from 'src/utils/terbilang'
import { SaleDetailType } from 'src/types/apps/sale/sale'
import { ReturnPurchaseDetailType } from 'src/types/apps/purchase/returnPurchase'
import { ReturnSaleDetailType } from 'src/types/apps/sale/returnSale'
import { RecapDetailType } from 'src/types/apps/recap/recap'
import { DialogDetailPurchaseInvoiceType } from 'src/components/dialog/DialogDetailPurchaseInvoice'

const GridSummary = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridGap: '4px'
    }}
  >
    <div
      style={{
        textAlign: 'right'
      }}
    >
      <div>
        <b>{label}</b>
      </div>
    </div>
    <div>
      <b>:</b> {value}
    </div>
  </div>
)

const TablePrintDetail = ({
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
                  item.discount_membership) *
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
    <div>
      <table
        style={{
          width: '100%'
        }}
      >
        <tr
          style={{
            fontWeight: 'bold'
          }}
        >
          <td>No</td>
          {type == 'recap' && <td>Order ID</td>}
          <td>{t('MSKU')}</td>
          <td>
            <div>{t('Product Name')}</div>
          </td>
          <td>{t('Variation')}</td>
          <td>Qty</td>
          <td>@{t('Price')}</td>
          <td>@{t('Discount')}</td>
          {type == 'recap' && <td>@{t('Discount')} Member</td>}
          <td>{t('Sub Total')}</td>
        </tr>
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
            <tr key={index}>
              <td>{index + 1}</td>
              {type == 'recap' && <td>{item.order_number}</td>}
              <td>{item.product.sku}</td>
              <td>{item.product.name}</td>
              <td>
                {productVariant
                  ? productVariant.attributes?.map((attribute: any) => attribute.value).join(' - ')
                  : '-'}
              </td>
              <td>
                {formatNumber(itemAny.quantity || itemAny.qty)} {item.product.unit?.name}
              </td>
              <td>{formatPriceIDR(item.price)}</td>
              <td>
                {type == 'recap' ? (
                  <>
                    {itemAny.discount / (itemAny.quantity || itemAny.qty) > 0
                      ? formatPriceIDR(itemAny.discount / (itemAny.quantity || itemAny.qty))
                      : '-'}
                  </>
                ) : (
                  <>
                    {(itemAny.discount ?? itemAny.qty ?? 0) > 0
                      ? formatPriceIDR(itemAny.discount ?? itemAny.qty ?? 0)
                      : '-'}
                  </>
                )}
              </td>
              {type == 'recap' && (
                <td>
                  {(item.discount_membership ?? 0) > 0
                    ? formatPriceIDR(item.discount_membership)
                    : '-'}
                </td>
              )}
              <td>
                {type == 'recap' ? (
                  <>
                    {formatPriceIDR(
                      (item.price -
                        (itemAny.discount
                          ? itemAny.discount / (itemAny.quantity || itemAny.qty)
                          : itemAny.discount_per_item ?? 0) -
                        item.discount_membership) *
                        (itemAny.quantity || itemAny.qty)
                    )}
                  </>
                ) : (
                  <>
                    {formatPriceIDR(
                      (item.price - (itemAny.discount ?? itemAny.discount_per_item ?? 0)) *
                        (itemAny.quantity || itemAny.qty)
                    )}
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </table>
      <hr />

      <div
        style={{
          display: 'flex',
          gap: '2',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            minWidth: '400px'
          }}
        >
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
        </div>
        <div>
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
        </div>
      </div>
    </div>
  )
}

export default TablePrintDetail
