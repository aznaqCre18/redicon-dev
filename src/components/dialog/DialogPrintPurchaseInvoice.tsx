import React, { useState } from 'react'
// import { useTranslation } from 'react-i18next'
import { formatDatePrint } from 'src/utils/dateUtils'
import { promise } from 'src/utils/promise'
// import Dialog from 'src/views/components/dialogs/Dialog'
import { useQuery } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import { recapService } from 'src/services/recap/recap'
import { RecapDetailType } from 'src/types/apps/recap/recap'
// import Dialog from 'src/views/components/dialogs/Dialog'
import TablePrintDetail from './TablePrintDetail'
import { PurchaseDetailType } from 'src/types/apps/purchase/purchase'
import { ReturnPurchaseDetailType } from 'src/types/apps/purchase/returnPurchase'
import { SaleDetailType } from 'src/types/apps/sale/sale'
import { ReturnSaleDetailType } from 'src/types/apps/sale/returnSale'
import { purchaseService } from 'src/services/purchase/purchase'
import { purchaseReturnService } from 'src/services/purchase/return'
import { saleService } from 'src/services/sale/sale'
import { returnSaleService } from 'src/services/sale/returnSale'
import { useTranslation } from 'react-i18next'

export type DialogDetailPurchaseInvoiceType =
  | 'purchase'
  | 'purchase_return'
  | 'sales'
  | 'sales_return'
  | 'recap'

type Props = {
  type: DialogDetailPurchaseInvoiceType
  id: string | undefined
  onClose: () => void
}

const DialogPrintPurchaseInvoice = ({ type, id, onClose }: Props) => {
  const { t } = useTranslation()
  const { bussiness } = useAuth()

  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseDetailType>()
  const [returnPurchaseDetail, setReturnPurchaseDetail] = useState<ReturnPurchaseDetailType>()
  const [saleDetail, setSaleDetail] = useState<SaleDetailType>()
  const [returnSaleDetail, setReturnSaleDetail] = useState<ReturnSaleDetailType>()
  const [recapDetail, setRecapDetail] = useState<RecapDetailType>()

  useQuery(['purchase-detail', id], {
    queryFn: () => purchaseService.getOne(id!),
    enabled: !!id && type == 'purchase',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setPurchaseDetail(data.data.data[0])
    },
    cacheTime: 0
  })

  useQuery(['return-purchase-detail', id], {
    queryFn: () => purchaseReturnService.getOne(id!),
    enabled: !!id && type == 'purchase_return',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setReturnPurchaseDetail(data.data.data[0])
    },
    cacheTime: 0
  })

  useQuery(['sale-detail', id], {
    queryFn: () => saleService.getOne(id!),
    enabled: !!id && type == 'sales',
    onSuccess: data => {
      setSaleDetail(data.data.data)
    },
    cacheTime: 0
  })

  useQuery(['return-sale-detail', id], {
    queryFn: () => returnSaleService.getOne(id!),
    enabled: !!id && type == 'sales_return',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setReturnSaleDetail(data.data.data[0])
    },
    cacheTime: 0
  })

  useQuery(['recap-detail', id], {
    queryFn: () => recapService.getOne(id!),
    enabled: !!id && type == 'recap',
    onSuccess: data => {
      setRecapDetail(data.data.data)
    },
    cacheTime: 0
  })

  React.useEffect(() => {
    // setOpen(
    //   purchaseDetail != undefined ||
    //     returnPurchaseDetail != undefined ||
    //     saleDetail != undefined ||
    //     returnSaleDetail != undefined ||
    //     recapDetail != undefined
    // )

    if (
      purchaseDetail != undefined ||
      returnPurchaseDetail != undefined ||
      saleDetail != undefined ||
      returnSaleDetail != undefined ||
      recapDetail != undefined
    ) {
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

        setRecapDetail(undefined)

        onClose()
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseDetail, returnPurchaseDetail, saleDetail, returnSaleDetail, recapDetail])

  return (
    // <Dialog open={open} onClose={onClose} title={'Print'} maxWidth='xl'>
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
        {(purchaseDetail != undefined ||
          returnPurchaseDetail != undefined ||
          saleDetail != undefined ||
          returnSaleDetail != undefined ||
          recapDetail != undefined) && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                textTransform: 'uppercase',
                fontSize: '20px'
              }}
            >
              <div>
                <b>{bussiness?.name}</b>
              </div>
              <div>
                <b>
                  INVOICE{' '}
                  {purchaseDetail != undefined
                    ? 'PEMBELIAN'
                    : returnPurchaseDetail != undefined
                    ? 'RETUR PEMBELIAN'
                    : saleDetail != undefined
                    ? 'PENJUALAN'
                    : returnSaleDetail != undefined
                    ? 'RETUR PENJUALAN'
                    : 'RECAP'}
                </b>
              </div>
            </div>
            <div
              style={{
                fontSize: '14px'
              }}
            >
              <b>{bussiness?.province.name}</b>
            </div>
            <hr />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr'
              }}
            >
              <table>
                <tr>
                  <td>
                    <b>
                      {type == 'purchase' && t('Purchase Number')}
                      {type == 'purchase_return' && t('Return Purchase Number')}
                      {type == 'sales' && t('Invoice Number')}
                      {type == 'sales_return' && t('Return Invoice Number')}
                      {type == 'recap' && t('Recap Number')}
                    </b>
                  </td>
                  <td>
                    <b>:</b> {type == 'purchase' && <>{purchaseDetail?.purchase_number}</>}
                    {type == 'purchase_return' && (
                      <>{returnPurchaseDetail?.return_purchase_number}</>
                    )}
                    {type == 'sales' && <>{saleDetail?.sales.order_id}</>}
                    {type == 'sales_return' && <>{returnSaleDetail?.return_sale_number}</>}
                    {type == 'recap' && <>{recapDetail?.invoice_number}</>}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>{t('Date')}</b>
                  </td>
                  <td>
                    <b>:</b>{' '}
                    {type == 'purchase' && (
                      <>
                        {purchaseDetail?.created_at && formatDatePrint(purchaseDetail.created_at)}
                      </>
                    )}
                    {type == 'purchase_return' && (
                      <>
                        {returnPurchaseDetail?.created_at &&
                          formatDatePrint(returnPurchaseDetail?.created_at)}
                      </>
                    )}
                    {type == 'sales' && (
                      <>
                        {saleDetail?.sales.created_at &&
                          formatDatePrint(saleDetail?.sales.created_at)}
                      </>
                    )}
                    {type == 'sales_return' && (
                      <>
                        {returnSaleDetail?.created_at &&
                          formatDatePrint(returnSaleDetail?.created_at)}
                      </>
                    )}
                    {type == 'recap' && (
                      <>{recapDetail?.created_at && formatDatePrint(recapDetail?.created_at)}</>
                    )}
                  </td>
                </tr>
              </table>
              <table
                style={{
                  marginBottom: 'auto'
                }}
              >
                {(type == 'purchase' || type == 'purchase_return') && (
                  <tr>
                    <td>
                      <b>{t('Supplier')}</b>
                    </td>
                    <td>
                      <b>:</b> {type == 'purchase' && <>{purchaseDetail?.supplier.name}</>}
                      {type == 'purchase_return' && <>{returnPurchaseDetail?.supplier.name}</>}
                    </td>
                  </tr>
                )}

                {['recap', 'sales', 'sales_return'].includes(type) && (
                  <tr>
                    <td>
                      <b>{t('Customer')}</b>
                    </td>
                    <td>
                      <b>:</b> {type == 'sales' && <> {saleDetail?.customer.name}</>}
                      {type == 'sales_return' && <> {returnSaleDetail?.customer.name}</>}
                      {type == 'recap' && <> {recapDetail?.customer.name}</>}
                    </td>
                  </tr>
                )}

                {type != 'recap' && (
                  <tr>
                    <td>
                      <b>{t('Outlet')}</b>
                    </td>
                    <td>
                      <b>:</b> {type == 'purchase' && <> {purchaseDetail?.outlet.name}</>}
                      {type == 'purchase_return' && <> {returnPurchaseDetail?.outlet.name}</>}
                      {type == 'sales' && <> {saleDetail?.outlet.name}</>}
                      {type == 'sales_return' && <> {returnSaleDetail?.outlet.name}</>}
                    </td>
                  </tr>
                )}
              </table>
            </div>
            <hr />
            <TablePrintDetail
              type={type}
              purchase={purchaseDetail}
              returnPurchase={returnPurchaseDetail}
              sale={saleDetail}
              returnSale={returnSaleDetail}
              recap={recapDetail}
            />
          </>
        )}
      </div>
    </div>
    // </Dialog>
  )
}

export default DialogPrintPurchaseInvoice
