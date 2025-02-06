import React, { useState } from 'react'
import AccountViewLayout from './components/AccountViewLayout'
import { Box, Checkbox, IconButton, Typography } from '@mui/material'
import TableHeader from 'src/views/setting/components/TableHeader'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { Icon } from '@iconify/react'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { useTranslation } from 'react-i18next'

const Page = () => {
  const { t } = useTranslation()
  const [paginationData] = useState<PageOptionRequestType>(defaultPagination)

  const columns: GridColDef[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      colSpan: ({ row }) => {
        if (row.rowsType === 'expandablerow') {
          return 10
        }

        return undefined
      },
      renderCell: index => {
        return (
          <Checkbox
            // checked={itemSelected.includes(index.row) || false}
            // onChange={e => handleChange(e, index.row.id, index.row)}
            key={index.row.id}
          />
        )
      },
      sortable: false,
      renderHeader: () => (
        <Checkbox
        //   indeterminate={isCheckboxIndeterminate()}
        //   checked={checkedAll}
        //   onChange={e => handleChange(e, 'all')}
        />
      )
    },
    {
      width: 22,
      field: 'no',
      headerName: 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (paginationData?.limit ?? 50) * ((paginationData?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 110,
      field: 'os',
      headerName: 'OS',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.os}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'date',
      minWidth: 80,
      headerName: 'Date Time',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.date}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'browser',
      minWidth: 80,
      headerName: 'Browser',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.browser}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'location',
      minWidth: 80,
      headerName: 'Location',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.location}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'ip_address',
      minWidth: 80,
      headerName: 'IP Address',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.ip_address}
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
    <AccountViewLayout tab='account-sessions'>
      <Box>
        <TableHeader title='Session' />
        <DataGrid autoHeight rows={[]} columns={columns} disableColumnMenu hideFooter />
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
