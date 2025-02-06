import { Box, Grid, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import DialogDetailPurchaseInvoice, {
  DialogDetailPurchaseInvoiceType
} from 'src/components/dialog/DialogDetailPurchaseInvoice'
import ImagePreview from 'src/components/image/ImagePreview'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { historyStockService } from 'src/services/product/history-stock'
import { ProductHistoryDetail } from 'src/types/apps/product/history-stock'
import { StockProduct } from 'src/types/apps/product/stock'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPaginationDesc } from 'src/types/pagination/pagination'
import { formatDate } from 'src/utils/dateUtils'
import { formatNumber } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

type Props = {
  product: StockProduct | undefined
  sku?: string
  product_variant_id?: number
  open: boolean
  onClose: () => void
}

const DialogChangeLog = ({ open, onClose, ...productData }: Props) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)

  const { sku, product_variant_id, product } = productData

  const [historystockData, setHistoryStockData] = useState<ProductHistoryDetail[]>([])
  const [productMeta, setProductMeta] = useState<MetaType>()
  const [paginationData, setPaginationData] = useState<PageOptionRequestType>(defaultPaginationDesc)

  const [filterOption, setFilterOption] = useState<string>('sku')
  const [filterOptionValue, setFilterOptionValue] = useState<string | undefined>(undefined)

  const [dialogDetailShowId, setDialogDetailShowId] = useState<string | null>(null)
  const [dialogDetailType, setDialogDetailType] = useState<
    DialogDetailPurchaseInvoiceType | undefined
  >(undefined)

  const handleShowDialogDetail = (id: string, type: DialogDetailPurchaseInvoiceType) => {
    setDialogDetailShowId(id)
    setDialogDetailType(type)
  }

  const getDisplayId = (data: ProductHistoryDetail) => {
    if (data.order?.order_number) {
      return data.order?.order_number
    } else if (data.purchase?.purchase_number) {
      return data.purchase?.purchase_number
    } else if (data.return_purchase?.return_purchase_number) {
      return data.return_purchase?.return_purchase_number
    } else if (data.sales?.order_id) {
      return data.sales?.order_id
    } else if (data.return_sales?.return_sale_number) {
      return data.return_sales?.return_sale_number
    } else {
      return '-'
    }
  }

  const handleClickRecordId = (data: ProductHistoryDetail) => {
    if (data.order?.order_number) {
      window.open('/order/detail/' + data.order?.id, '_blank')
    } else if (data.purchase?.purchase_number) {
      handleShowDialogDetail(data.purchase?.id.toString() ?? null, 'purchase')
    } else if (data.return_purchase?.return_purchase_number) {
      handleShowDialogDetail(data.return_purchase?.id.toString() ?? null, 'purchase_return')
    } else if (data.sales?.order_id) {
      handleShowDialogDetail(data.sales?.id.toString() ?? null, 'sales')
    } else if (data.return_sales?.return_sale_number) {
      handleShowDialogDetail(data.return_sales?.id.toString() ?? null, 'sales_return')
    }
  }

  useQuery(['stock-history-list', paginationData], {
    queryFn: () => historyStockService.getList(paginationData),
    onSuccess: data => {
      console.log(data)

      setIsLoading(false)
      if (data) {
        setHistoryStockData(data.data.data ?? [])
        setProductMeta(data.data.meta)
      }
    },
    onError: () => {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    setIsLoading(true)
    delete paginationData.sku
    delete paginationData.product_name
    delete paginationData.product_variant_id
    delete paginationData.vsku

    setPaginationData({
      ...paginationData,
      [filterOption]: filterOptionValue == '' ? undefined : filterOptionValue,
      page: 1
    })

    if (filterOptionValue == '' || filterOptionValue == undefined) {
      setIsLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOption, filterOptionValue])

  const columns: GridColDef<ProductHistoryDetail>[] = [
    {
      width: 22,
      headerName: t('No') ?? 'No',
      disableColumnMenu: true,
      sortable: false,
      field: 'number',
      renderCell: (index: GridRenderCellParams) => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.product_history.id) ?? 1) +
          1 +
          (paginationData?.limit ?? 50) * ((paginationData?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 2,
      field: 'updated_at',
      headerName: t('Date') ?? 'Date',
      renderCell: params => formatDate(params.row.product_history.updated_at)
    },
    {
      flex: 1.3,
      field: 'id',
      headerName: 'Record ID',
      renderCell: index => (
        <Typography
          className='hover-underline'
          sx={{
            color: 'primary.main',
            fontWeight: 600
          }}
          onClick={() => handleClickRecordId(index.row)}
        >
          {getDisplayId(index.row)}
        </Typography>
      )
    },
    {
      sortable: false,
      flex: 1.8,
      field: 'operator',
      headerName: 'Operator',
      renderCell: index =>
        index.row.product_history.type.includes('Sistem')
          ? 'Sistem'
          : index.row.user?.name ?? index.row?.customer?.name ?? '-'
    },
    {
      flex: 2,
      field: 'type',
      headerName: t('Operation') ?? 'Operation',
      renderCell: index => index.row.product_history.type
    },
    {
      width: 80,
      field: 'stock_before',
      headerName: t('Stock Before') ?? 'Stock Before',
      renderCell: index => formatNumber(index.row.product_history.stock_before)
    },
    {
      width: 80,
      sortable: false,
      field: 'perubahan',
      headerName: t('Change') ?? 'Change',
      renderCell: index =>
        index.row.product_history.stock_in > 0 ? (
          <Typography color={'green'} fontWeight={600}>
            +{formatNumber(index.row.product_history.stock_in)}
          </Typography>
        ) : index.row.product_history.stock_out > 0 ? (
          <Typography color={'error'} fontWeight={600}>
            -{formatNumber(index.row.product_history.stock_out)}
          </Typography>
        ) : (
          <Typography fontWeight={600}>0</Typography>
        )
    },
    {
      width: 80,
      field: 'final_stock',
      headerName: t('Final Stock') ?? 'Final Stock',
      renderCell: index => formatNumber(index.row.product_history.final_stock)
    }
  ]

  useEffect(() => {
    if (open) {
      if (sku) {
        setFilterOption('sku')
        setFilterOptionValue(sku)
      }

      if (product_variant_id) {
        setFilterOption('product_variant_id')
        setFilterOptionValue(product_variant_id.toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog
      title={t('History Stock')}
      open={open}
      onClose={onClose}
      maxWidth={'lg'}
      enableCloseBackdrop
    >
      <Box>
        <Box display={'flex'} gap={2}>
          <ImagePreview
            avatar={product && product.media && product.media.length > 0 ? product.media[0] : ''}
            fullName={(product && product?.name) ?? ''}
          />
          <Box>
            <Typography variant='body1'>{product?.name}</Typography>
            <Grid container flexDirection={'column'}>
              <Grid item>
                <Typography variant='body1'>MSKU: {product?.sku}</Typography>
              </Grid>
              {product?.attributes && (
                <>
                  {product?.vsku && (
                    <Grid item>
                      <Typography variant='body1'>
                        {product?.vsku && `VSKU: ${product?.vsku}`}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant='body1'>
                      {t('Variation')}:{' '}
                      {product?.attributes?.map(attribute => attribute.value).join(' - ') ?? '-'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
      {/* <Grid container mt={2} spacing={2}>
        <Grid item xs={3}>
          <TextField size='small' placeholder='Date' />
        </Grid>
        <Grid item xs={3}>
          <TextField size='small' placeholder='Operator' />
        </Grid>
        <Grid item xs={3}>
          <TextField size='small' placeholder='Operation/Description' />
        </Grid>
        <Grid container item xs={3} spacing={2}>
          <Grid item xs={6}>
            <Button fullWidth variant='outlined'>
              Reset
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant='contained'>
              Search
            </Button>
          </Grid>
        </Grid>
      </Grid> */}
      <Box mt={4}>
        <DataGridCustom
          sx={{
            '& .MuiDataGrid-cell:last-of-type': {
              paddingRight: 1
            },
            '& .MuiDataGrid-row': {
              minHeight: '2.6rem !important'
            }
          }}
          getRowId={row => row.product_history.id}
          loading={isLoading}
          rowSelection={false}
          autoHeight
          getRowHeight={() => 'auto'}
          rows={historystockData}
          columns={columns}
          disableColumnMenu
          setPaginationData={setPaginationData}
          meta={productMeta}
          onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
        />
      </Box>
      <>
        {dialogDetailType && dialogDetailShowId !== null && (
          <DialogDetailPurchaseInvoice
            type={dialogDetailType}
            title={t(
              dialogDetailType === 'purchase'
                ? 'Purchase Detail'
                : dialogDetailType === 'purchase_return'
                ? 'Return Purchase Detail'
                : dialogDetailType === 'sales'
                ? 'Invoice Detail'
                : 'Return Invoice Detail'
            )}
            open={dialogDetailShowId !== null}
            toggle={() => setDialogDetailShowId(null)}
            id={dialogDetailShowId}
          />
        )}
      </>
    </Dialog>
  )
}

export default DialogChangeLog
