import { Grid } from '@mui/material'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { purchaseService } from 'src/services/purchase/purchase'
import { PurchaseDetailType } from 'src/types/apps/purchase/purchase'
import { formatDate } from 'src/utils/dateUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import TableListItemDetail from './TableListItemDetail'
import { useTranslation } from 'react-i18next'
import { purchaseReturnService } from 'src/services/purchase/return'
import { saleService } from 'src/services/sale/sale'
import { returnSaleService } from 'src/services/sale/returnSale'
import { ReturnPurchaseDetailType } from 'src/types/apps/purchase/returnPurchase'
import { SaleDetailType } from 'src/types/apps/sale/sale'
import { ReturnSaleDetailType } from 'src/types/apps/sale/returnSale'
import { RecapDetailType } from 'src/types/apps/recap/recap'
import { recapService } from 'src/services/recap/recap'

export type DialogDetailPurchaseInvoiceType =
  | 'purchase'
  | 'purchase_return'
  | 'sales'
  | 'sales_return'
  | 'recap'

interface DialogProps {
  type: DialogDetailPurchaseInvoiceType
  title: string
  open: boolean
  toggle: () => void
  id: string | null
}
const DialogDetailPurchaseInvoice = (props: DialogProps) => {
  const { t } = useTranslation()
  const { type, title, open, toggle, id } = props

  const handleClose = () => {
    toggle()
  }

  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseDetailType>()
  const [returnPurchaseDetail, setReturnPurchaseDetail] = useState<ReturnPurchaseDetailType>()
  const [saleDetail, setSaleDetail] = useState<SaleDetailType>()
  const [returnSaleDetail, setReturnSaleDetail] = useState<ReturnSaleDetailType>()
  const [recapDetail, setRecapDetail] = useState<RecapDetailType>()

  const queryPurchaseDetail = useQuery(['purchase-detail', id], {
    queryFn: () => purchaseService.getOne(id),
    enabled: !!id && type == 'purchase',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setPurchaseDetail(data.data.data[0])
    }
  })

  const queryReturnPurchaseDetail = useQuery(['return-purchase-detail', id], {
    queryFn: () => purchaseReturnService.getOne(id),
    enabled: !!id && type == 'purchase_return',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setReturnPurchaseDetail(data.data.data[0])
    }
  })

  const querySaleDetail = useQuery(['sale-detail', id], {
    queryFn: () => saleService.getOne(id),
    enabled: !!id && type == 'sales',
    onSuccess: data => {
      setSaleDetail(data.data.data)
    }
  })

  const queryReturnSaleDetail = useQuery(['return-sale-detail', id], {
    queryFn: () => returnSaleService.getOne(id),
    enabled: !!id && type == 'sales_return',
    onSuccess: data => {
      if (data.data.data.length == 0) return

      setReturnSaleDetail(data.data.data[0])
    }
  })

  const queryRecapDetail = useQuery(['recap-detail', id], {
    queryFn: () => recapService.getOne(id),
    enabled: !!id && type == 'recap',
    onSuccess: data => {
      setRecapDetail(data.data.data)
    }
  })

  return (
    <Dialog maxWidth='lg' title={title} open={open} onClose={handleClose} enableCloseBackdrop>
      {queryPurchaseDetail.isLoading ||
      queryReturnPurchaseDetail.isLoading ||
      querySaleDetail.isLoading ||
      queryReturnSaleDetail.isLoading ||
      queryRecapDetail.isLoading ? (
        <div>Loading...</div>
      ) : (
        <Grid container gap={4}>
          <Grid container item xs={12}>
            <Grid item xs={6}>
              <table>
                <tr>
                  <td>
                    {type == 'purchase' && t('Purchase Number')}
                    {type == 'purchase_return' && t('Return Purchase Number')}
                    {type == 'sales' && t('Invoice Number')}
                    {type == 'sales_return' && t('Return Invoice Number')}
                    {type == 'recap' && t('Recap Number')}
                  </td>
                  {type == 'purchase' && <td>: {purchaseDetail?.purchase_number}</td>}
                  {type == 'purchase_return' && (
                    <td>: {returnPurchaseDetail?.return_purchase_number}</td>
                  )}
                  {type == 'sales' && <td>: {saleDetail?.sales.order_id}</td>}
                  {type == 'sales_return' && <td>: {returnSaleDetail?.return_sale_number}</td>}
                  {type == 'recap' && <td>: {recapDetail?.invoice_number}</td>}
                </tr>
                <tr>
                  <td>{t('Date')}</td>
                  {type == 'purchase' && (
                    <td>: {purchaseDetail?.created_at && formatDate(purchaseDetail.created_at)}</td>
                  )}
                  {type == 'purchase_return' && (
                    <td>
                      :{' '}
                      {returnPurchaseDetail?.created_at &&
                        formatDate(returnPurchaseDetail?.created_at)}
                    </td>
                  )}
                  {type == 'sales' && (
                    <td>
                      : {saleDetail?.sales.created_at && formatDate(saleDetail?.sales.created_at)}
                    </td>
                  )}
                  {type == 'sales_return' && (
                    <td>
                      : {returnSaleDetail?.created_at && formatDate(returnSaleDetail?.created_at)}
                    </td>
                  )}
                  {type == 'recap' && (
                    <td>: {recapDetail?.created_at && formatDate(recapDetail?.created_at)}</td>
                  )}
                </tr>
              </table>
            </Grid>
            <Grid item xs={6}>
              <table>
                {(type == 'purchase' || type == 'purchase_return') && (
                  <tr>
                    <td>{t('Supplier')}</td>
                    {type == 'purchase' && <td>: {purchaseDetail?.supplier?.name}</td>}
                    {type == 'purchase_return' && <td>: {returnPurchaseDetail?.supplier?.name}</td>}
                  </tr>
                )}
                {['recap', 'sales', 'sales_return'].includes(type) && (
                  <tr>
                    <td>{t('Customer')}</td>
                    {type == 'sales' && <td>: {saleDetail?.customer.name}</td>}
                    {type == 'sales_return' && <td>: {returnSaleDetail?.customer.name}</td>}
                    {type == 'recap' && <td>: {recapDetail?.customer.name}</td>}
                  </tr>
                )}
                {type != 'recap' && (
                  <tr>
                    <td>{t('Outlet')}</td>
                    {type == 'purchase' && <td>: {purchaseDetail?.outlet?.name}</td>}
                    {type == 'purchase_return' && <td>: {returnPurchaseDetail?.outlet?.name}</td>}
                    {type == 'sales' && <td>: {saleDetail?.outlet?.name}</td>}
                    {type == 'sales_return' && <td>: {returnSaleDetail?.outlet?.name}</td>}
                  </tr>
                )}
              </table>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableListItemDetail
              type={type}
              purchase={purchaseDetail}
              returnPurchase={returnPurchaseDetail}
              sale={saleDetail}
              returnSale={returnSaleDetail}
              recap={recapDetail}
            />
          </Grid>
        </Grid>
      )}
    </Dialog>
  )
}

export default DialogDetailPurchaseInvoice
