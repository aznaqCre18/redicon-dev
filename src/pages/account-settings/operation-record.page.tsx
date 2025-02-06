import React, { useState } from 'react'
import AccountViewLayout from './components/AccountViewLayout'
import { Box, Checkbox, Typography } from '@mui/material'
import TableHeader from 'src/views/setting/components/TableHeader'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
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
      field: 'module',
      headerName: 'Module',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.module}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'action',
      minWidth: 80,
      headerName: t('Action') ?? 'Action',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.action}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'description',
      minWidth: 80,
      headerName: 'Description',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.description}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'expired',
      minWidth: 80,
      headerName: 'Expired',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.expired}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'operator',
      minWidth: 80,
      headerName: 'Operator',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.operator}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'date_time',
      minWidth: 80,
      headerName: 'Date Time',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.date_time}
        </Typography>
      )
    }
  ]

  return (
    <AccountViewLayout tab='account-operation-record'>
      <Box>
        <TableHeader title='Operation Record' />
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
