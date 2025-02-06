import React, { useState } from 'react'
// import { useTranslation } from 'react-i18next'
import { OrderFullDetailType } from 'src/types/apps/order'
import { formatDatePrint } from 'src/utils/dateUtils'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { promise } from 'src/utils/promise'
// import Dialog from 'src/views/components/dialogs/Dialog'
import Barcode from 'react-jsbarcode'
import { useQuery } from 'react-query'
import { orderSettingService } from 'src/services/vendor/settings/order'
import { OrderPrintSettingType } from 'src/types/apps/vendor/settings/order'
import { useAuth } from 'src/hooks/useAuth'
import { getImageAwsUrl } from 'src/utils/imageUtils'

type Props = {
  orderData: OrderFullDetailType | undefined
  onClose: () => void
}

const PrintOrderDialog = ({ orderData, onClose }: Props) => {
  const [orderPrintSetting, setOrderPrintSetting] = useState<OrderPrintSettingType>()
  const { bussiness } = useAuth()

  useQuery('order-print-setting', orderSettingService.getPrintSetting, {
    onSuccess: data => {
      setOrderPrintSetting(data.data.data) //   const { t } = useTranslation()
    }
  })

  const [open, setOpen] = React.useState(orderData != undefined)
  const [subTotal, setSubTotal] = React.useState(0)

  React.useEffect(() => {
    setOpen(orderData != undefined)

    if (orderData && open && orderPrintSetting) {
      let total = 0
      orderData.order_items.forEach(item => {
        total += item.total
      })

      setSubTotal(total)

      promise(() => {
        const printThis = document.getElementById('print-this')
        if (printThis) {
          let html = '<html>'
          html += printThis.innerHTML
          html += '</html>'
          const printWin = window.open(
            '',
            '',
            'left=0,top=0,width=1024,height=768,toolbar=0,scrollbars=0,status  =0'
          )

          if (printWin) {
            printWin.document.write(html)
            printWin.document.close()
            promise(() => {
              printWin.focus()
              printWin.print()
              printWin.close()
            }, 500)
          }
        }

        onClose()
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderData, orderPrintSetting])

  return (
    // <Dialog
    //   open={open}
    //   onClose={onClose}
    //   title={t('Print') + ' ' + t('Order') + ` #${orderData && orderData.order.order_number}`}
    // >
    <div
      id='print-this'
      style={{
        display: 'none'
      }}
    >
      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      </style>
      <div
        style={{
          fontFamily: 'Courier Prime, monospace',
          fontWeight: '400',
          fontStyle: 'normal',
          fontSize: '14px'
        }}
      >
        {orderData && orderPrintSetting && (
          <>
            {(orderPrintSetting.show_logo ||
              orderPrintSetting.show_outlet_name ||
              orderPrintSetting.show_outlet_address) && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  alignItems: 'center'
                }}
              >
                {orderPrintSetting.show_logo && bussiness?.logo && (
                  <div
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    <img
                      src={getImageAwsUrl(bussiness?.logo)}
                      alt='logo'
                      style={{
                        height: '50px'
                      }}
                    />
                  </div>
                )}

                {(orderPrintSetting.show_outlet_name || orderPrintSetting.show_outlet_address) && (
                  <div
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    {orderPrintSetting.show_outlet_name && (
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          marginTop: '0px',
                          marginBottom: '0px'
                        }}
                      >
                        {orderPrintSetting.outlet_name}
                      </p>
                    )}
                    {orderPrintSetting.show_outlet_address && <small>{bussiness?.address}</small>}
                  </div>
                )}
              </div>
            )}

            <table
              style={{
                width: '100%',
                fontSize: '14px'
              }}
            >
              <tr>
                <td width={'18%'}>Nota</td>
                <td width={'3%'}>:</td>
                <td width={'79%'}>{orderData.order.order_number}</td>
              </tr>
              <tr>
                <td>Tgl Order</td>
                <td>:</td>
                <td>{formatDatePrint(orderData.order.created_at)}</td>
              </tr>
              {orderPrintSetting.show_customer_name && (
                <tr>
                  <td>Pelanggan</td>
                  <td>:</td>
                  <td>{orderData.order.customer_address?.name ?? orderData.order.customer.name}</td>
                </tr>
              )}
              {orderPrintSetting.show_customer_address &&
                orderData.order.customer_address?.address && (
                  <tr>
                    <td>Alamat</td>
                    <td>:</td>
                    <td>{orderData.order.customer_address?.address}</td>
                  </tr>
                )}
              {orderPrintSetting.show_customer_contact && (
                <tr>
                  <td>Kontak</td>
                  <td>:</td>
                  <td>
                    {orderData.order.customer_address?.phone ?? orderData.order.customer.phone}
                  </td>
                </tr>
              )}
            </table>
            <div style={{ borderBottom: '1px dashed #000000', margin: '4px' }}></div>
            {/* text to right */}
            {orderData.order_items.map(item => (
              //     <tr key={index}>
              //     <td>{index + 1}</td>
              //     <td>{item.product.name}</td>
              //     <td>{item.quantity}</td>
              //     <td>{item.price}</td>
              //     <td>{item.total}</td>
              //   </tr>
              <>
                <table
                  style={{
                    width: '100%',
                    fontSize: '14px'
                  }}
                >
                  <tr>
                    {/* style only one line text */}
                    <td
                      colSpan={6}
                      style={{
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.product.name}
                    </td>
                  </tr>
                  <tr>
                    {orderPrintSetting.show_unit_price && (
                      <td colSpan={3}>
                        <>
                          {formatNumber(item.quantity)} x{' '}
                          {formatPriceIDR(
                            item.price - item.discount_per_item + item.fix_tax_per_item
                          )}
                        </>
                      </td>
                    )}
                    {/* style text to right */}
                    <td
                      colSpan={3}
                      style={{
                        textAlign: 'right'
                      }}
                    >
                      {formatPriceIDR(item.total)}
                    </td>
                  </tr>
                  <tr>
                    {item.product_variant && (
                      <td colSpan={2}>
                        {/* variasi */}
                        {item.product_variant.attributes
                          .map(attribute => attribute.value)
                          .join(' - ')}
                      </td>
                    )}
                    {(orderPrintSetting.show_msku || orderPrintSetting.show_vsku) && (
                      <td colSpan={2}>
                        {[
                          ...(orderPrintSetting.show_msku ? [`MSKU: ${item.product.sku}`] : []),
                          ...(item.product_variant &&
                          item.product_variant.sku != '' &&
                          orderPrintSetting.show_vsku
                            ? [`VSKU: ${item.product_variant.sku}`]
                            : [])
                        ].join(' | ')}
                      </td>
                    )}
                  </tr>
                  {item.note && item.note != '' && (
                    <tr>
                      <td colSpan={6}>Catatan: {item.note}</td>
                    </tr>
                  )}

                  {orderPrintSetting.show_rack &&
                    item.product.rack_position &&
                    item.product.rack_position != '' && (
                      <tr>
                        <td colSpan={6}>Rak: {item.product.rack_position}</td>
                      </tr>
                    )}
                </table>
                <div style={{ borderBottom: '1px dashed #000000', margin: '4px' }}></div>
              </>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  padding: '4px'
                }}
              >
                {orderData.order.item_qty} Item
              </div>
              <table
                style={{
                  fontSize: '14px'
                }}
              >
                {/* Sub Total, Ongkir, Grand Total, Pembayaran */}
                <tr>
                  {/* top text and 100% */}
                  <td>Sub Total</td>
                  <td>:</td>
                  <td>{formatPriceIDR(subTotal)}</td>
                </tr>
                {orderPrintSetting.show_shipping_price && (
                  <tr>
                    <td>Ongkir</td>
                    <td>:</td>
                    <td>{formatPriceIDR(orderData.order.shipping_cost)}</td>
                  </tr>
                )}
                <tr>
                  <td>Grand Total</td>
                  <td>:</td>
                  <td>{formatPriceIDR(orderData.order.grand_total)}</td>
                </tr>
                {orderPrintSetting.show_payment_method && (
                  <tr>
                    <td>Pembayaran</td>
                    <td>:</td>
                    <td>
                      {orderData.order.cod_payment
                        ? orderData.order.cod_payment.name
                        : orderData.order.payment_method_detail
                        ? orderData.order.payment_method_detail.bank_name
                        : orderData.order.payment_method}
                    </td>
                  </tr>
                )}
                {orderPrintSetting.show_shipping_type && (
                  <tr>
                    <td>Pengiriman</td>
                    <td>:</td>
                    <td>{orderData.order.shipping?.name ?? '-'}</td>
                  </tr>
                )}
              </table>
            </div>
            {orderPrintSetting.show_note && (
              <div
                style={{
                  padding: '10px',
                  textAlign: 'center'
                }}
              >
                <p>{orderPrintSetting.note}</p>
              </div>
            )}
            {orderPrintSetting.show_barcode && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Barcode
                  value={orderData.order.order_number}
                  options={{ format: 'code128', displayValue: false, height: 60 }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
    // </Dialog>
  )
}

export default PrintOrderDialog
