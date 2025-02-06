import React, { useEffect, useState } from 'react'
import AccountViewLayout from '../components/AccountViewLayout'
import { Box, IconButton, Typography } from '@mui/material'
import TableHeader from 'src/views/setting/components/TableHeader'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { Icon } from '@iconify/react'
import { PageOptionRequestType, defaultPaginationDesc } from 'src/types/pagination/pagination'
import { useTranslation } from 'react-i18next'
import { OutletSubscriptionDetailType } from 'src/types/apps/outlet/subscription'
import { useQuery } from 'react-query'
import { outletSubscriptionService } from 'src/services/outlet/subscription'
import { formatDateOnly } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { useRouter } from 'next/navigation'

const Page = () => {
  const route = useRouter()
  const { t } = useTranslation()
  const [paginationData, setPaginationData] = useState<PageOptionRequestType>(defaultPaginationDesc)
  const [search, setSearch] = useState<string>('')

  const [datas, setDatas] = useState<OutletSubscriptionDetailType[]>([])

  useQuery(['subscription', paginationData], {
    queryFn: () => outletSubscriptionService.getList(paginationData),
    onSuccess: data => {
      setDatas(data?.data?.data ?? [])
    }
  })

  useEffect(() => {
    delete paginationData.search

    setPaginationData({
      ...paginationData,
      query: search
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const columns: GridColDef<OutletSubscriptionDetailType>[] = [
    // {
    //   cellClassName: 'padding-left-01rem',
    //   headerClassName: 'padding-left-01rem',
    //   width: 42,
    //   headerName: 'Checkbox',
    //   field: 'checkbox',
    //   renderCell: index => {
    //     return (
    //       <Checkbox
    //         // checked={itemSelected.includes(index.row) || false}
    //         // onChange={e => handleChange(e, index.row.id, index.row)}
    //         key={index.row.outlet_subscription.id}
    //       />
    //     )
    //   },
    //   sortable: false,
    //   renderHeader: () => (
    //     <Checkbox
    //     //   indeterminate={isCheckboxIndeterminate()}
    //     //   checked={checkedAll}
    //     //   onChange={e => handleChange(e, 'all')}
    //     />
    //   )
    // },
    {
      width: 22,
      field: 'no',
      headerName: 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.outlet_subscription.id) ?? 1) +
          1 +
          (paginationData?.limit ?? 50) * ((paginationData?.page ?? 1) - 1)
        )
      }
    },
    {
      width: 120,
      field: 'id',
      headerName: t('Transaction ID') ?? 'Transaction ID',
      renderCell: params => (
        <Typography
          className='hover-underline'
          noWrap
          variant='body2'
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
          // onClick={() => handleOpenDetail(params.row.outlet_subscription.id.toString())}
        >
          {'0'.repeat(5 - params.row.outlet_subscription.id.toString().length) +
            params.row.outlet_subscription.id}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'created_at',
      minWidth: 80,
      headerName: t('Date') ?? 'Date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatDateOnly(params.row.outlet_subscription.created_at)}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'subscription_name',
      minWidth: 80,
      headerName: t('Subscription') ?? 'Subscription',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.subscription.name} ({params.row.outlet_subscription.duration}{' '}
          {t(params.row.outlet_subscription.term + '2')})
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'expired',
      minWidth: 80,
      headerName: t('Expired') ?? 'Expired',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.outlet_subscription.expired_at
            ? formatDateOnly(params.row.outlet_subscription.expired_at)
            : '-'}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'total',
      minWidth: 80,
      headerName: 'Total',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatPriceIDR(params.row.outlet_subscription.total_amount)}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'payment_method',
      minWidth: 80,
      headerName: t('Payment Method') ?? 'Payment Method',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.outlet_subscription.payment_method}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'status',
      minWidth: 80,
      headerName: 'Status',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.outlet_subscription.status}
        </Typography>
      )
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: () => {
        return (
          <>
            <IconButton
              size='small'
              // onClick={() => handleDetail(params.row.id)}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
            <IconButton
              size='small'
              // onClick={() => handleDelete(params.row.id)}
            >
              <Icon icon='tabler:trash' fontSize={20} />
            </IconButton>
          </>
        )
      }
    }
  ]

  return (
    <AccountViewLayout tab='account-subscription'>
      <Box>
        <TableHeader
          title={t('Subscription') ?? 'Subscription'}
          onSearch={val => setSearch(val)}
          onAdd={() => route.push('/account-settings/subscription/add')}
        />
        <DataGrid
          autoHeight
          getRowId={param => param.outlet_subscription.id}
          rows={datas}
          columns={columns}
          disableColumnMenu
          hideFooter
        />
        <PaginationCustom
          itemSelected={[]}
          meta={{
            page: 1,
            per_page: 50,
            total_count: 0,
            total_pages: 1
          }}
          onChangePagination={() => {
            console.log()
          }}
        />
      </Box>
    </AccountViewLayout>
  )
}

export default Page
