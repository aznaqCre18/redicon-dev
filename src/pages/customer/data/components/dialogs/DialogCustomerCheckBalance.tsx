import { Box, Card, CardContent, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { customerService } from 'src/services/customer'
import { CustomerGFPaymentType, CustomerType } from 'src/types/apps/customerType'
import { formatDate } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

type DialogCustomerCheckBalanceProps = {
  open: boolean
  onClose: () => void
  customer: CustomerType
}

const DialogCustomerCheckBalance = (props: DialogCustomerCheckBalanceProps) => {
  const { t } = useTranslation()

  const [data, setData] = React.useState<CustomerGFPaymentType[]>([])

  useQuery(['customer-gf-payment', props.customer.id], {
    enabled: Boolean(props.open && props.customer.id),
    queryFn: () => customerService.mutationGfPayment(parseInt(props.customer.id)),
    onSuccess: data => {
      setData(data.data.data)
    }
  })

  const columns: GridColDef<CustomerGFPaymentType>[] = [
    {
      width: 50,
      sortable: false,
      field: 'id',
      headerName: t('No') ?? 'No'
    },
    {
      width: 180,
      field: 'input_datetime',
      headerName: t('Date') ?? 'Date',
      renderCell: params => <Typography>{formatDate(params.value)}</Typography>
    },
    {
      flex: 1,
      sortable: false,
      field: 'catatan',
      headerName: t('Note') ?? 'Note'
    },
    {
      flex: 1,
      sortable: false,
      field: 'debet',
      headerName: t('Debit') ?? 'Debit',
      renderCell: params => <Typography color='green'>{formatPriceIDR(params.value)}</Typography>
    },
    {
      flex: 1,
      sortable: false,
      field: 'kredit',
      headerName: t('Credit') ?? 'Credit',
      renderCell: params => <Typography color='error'>{formatPriceIDR(params.value)}</Typography>
    },
    {
      flex: 1,
      sortable: false,
      field: 'balance',
      headerName: t('Last Balance') ?? 'Last Balance',
      renderCell: params => <Typography color='primary'>{formatPriceIDR(params.value)}</Typography>
    },
    {
      flex: 1,
      sortable: false,
      field: 'input_user',
      headerName: t('Input By') ?? 'Input By'
    }
  ]

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={t('Mutation') + ' ' + props.customer.name}
      maxWidth='lg'
    >
      <Box display={'flex'} justifyContent={'start'} alignItems={'center'}>
        <Card color='primary' variant='outlined'>
          <CardContent>
            <Box display={'flex'} alignItems={'center'} gap={20}>
              <div>{t('Balance')}</div>
              <Typography
                sx={{
                  fontWeight: 'bold'
                }}
                fontSize={18}
              >
                {formatPriceIDR(props.customer.gf_payment_balance)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box mt={8}>
        <Typography variant='h6' mb={2}>
          {t('Mutation History')}
        </Typography>
        <DataGridCustom
          sx={{
            '& .MuiDataGrid-cell:last-of-type': {
              paddingRight: 1
            },
            '& .MuiDataGrid-row': {
              minHeight: '2.6rem !important'
            }
          }}
          autoHeight
          getRowHeight={() => 'auto'}
          columns={columns}
          rows={data}
          pageSize={5}
          rowSelection={false}
          disableColumnMenu
        />
      </Box>
    </Dialog>
  )
}

export default DialogCustomerCheckBalance
