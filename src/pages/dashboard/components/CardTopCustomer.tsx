import { Card, CardHeader, Tooltip, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardTopCustomer } from 'src/types/apps/dashboard/dashboard'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'

const CardTopCustomer = ({
  data,
  viewAllHref
}: {
  data: DashboardTopCustomer[]
  viewAllHref: string
}) => {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        height: '100%'
      }}
    >
      <CardHeader
        title={`Top ${t('Customer')}`}
        action={
          <Typography
            className='hover-underline'
            noWrap
            variant='body2'
            sx={{
              color: 'primary.main',
              fontWeight: 600
            }}
            component={Link}
            href={viewAllHref}
          >
            {t('View All')}
          </Typography>
        }
      />
      <DataGrid
        rows={data}
        getRowId={row => row.name}
        columns={[
          {
            sortable: false,
            disableColumnMenu: true,
            field: 'id',
            headerName: 'No',
            width: 20,
            // index.api.getRowIndexRelativeToVisibleRows(index.row.customer.id) ?? 1)
            renderCell: params => {
              return (
                <Typography variant='body2'>
                  {params.api.getRowIndexRelativeToVisibleRows(params.row.name) + 1}
                </Typography>
              )
            }
          },
          {
            sortable: false,
            disableColumnMenu: true,
            field: 'name',
            headerName: t('Customer') ?? 'Customer',
            flex: 1,
            renderCell: params => {
              return (
                <Tooltip title={params.value}>
                  <Typography variant='body2'>{params.value}</Typography>
                </Tooltip>
              )
            }
          },
          {
            sortable: false,
            disableColumnMenu: true,
            field: 'quantity_sold',
            headerName: t('Buy') ?? 'Buy',

            renderCell: params => {
              return (
                <Typography variant='body2' textAlign={'center'} width={'100%'}>
                  {formatNumber(params.value)}
                </Typography>
              )
            }
          },
          {
            sortable: false,
            disableColumnMenu: true,
            field: 'total_sales',
            headerName: t('Total') ?? 'Total',
            flex: 1,
            renderCell: params => {
              return <Typography variant='body2'>{formatPriceIDR(params.value)}</Typography>
            }
          }
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 }
          }
        }}
        pageSizeOptions={[5, 10]}
      />
    </Card>
  )
}

export default CardTopCustomer
