import { DataGrid, GridColDef } from '@mui/x-data-grid'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { logPriceService } from 'src/services/product/log-price'
import { LogPriceType } from 'src/types/apps/product/log-price'
import { defaultPaginationDesc } from 'src/types/pagination/pagination'
import { formatDate } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

type Props = {
  productId: number
  level?: number
  onClose: () => void
}

const DialogLogPrice = ({ onClose, productId, level }: Props) => {
  const { t } = useTranslation()

  const [open, setOpen] = React.useState(level != undefined)

  const [data, setData] = React.useState<LogPriceType[]>([])

  useQuery(
    ['logPrice', { productId, level }],
    () =>
      logPriceService.getList({
        ...defaultPaginationDesc,
        ...{
          product_id: productId,
          level: level,
          limit: 1000
        }
      }),
    {
      enabled: level != undefined,
      onSuccess: res => {
        setData(res.data.data ?? [])
      }
    }
  )

  React.useEffect(() => {
    setOpen(level != undefined)
  }, [level])

  const columns: GridColDef<LogPriceType>[] = [
    {
      flex: 1,
      field: 'created_at',
      headerName: t('Date') ?? 'Date',
      renderCell: row => formatDate(row.value)
    },
    {
      flex: 1,
      field: 'price',
      headerName: t('Price') ?? 'Price',
      renderCell: row => formatPriceIDR(row.value)
    },
    // level
    {
      flex: 1,
      field: 'name',
      headerName: t('Name') ?? 'Name'
    }
  ]

  return (
    <Dialog open={open} onClose={onClose} title={t('History Selling Price') + ` (Level ${level})`}>
      <DataGrid columns={columns} rows={data} autoHeight />
    </Dialog>
  )
}

export default DialogLogPrice
