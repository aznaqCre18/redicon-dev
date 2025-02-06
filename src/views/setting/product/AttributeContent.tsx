import React, { useState } from 'react'
import { GridColDef, DataGrid } from '@mui/x-data-grid'
import { Typography, IconButton, Pagination, Checkbox } from '@mui/material'
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'
import AddAttribute from './dialog/AddAttribute'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from '../components/TableHeader'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { useTranslation } from 'react-i18next'

interface CellType {
  api: { getRowIndexRelativeToVisibleRows: (arg0: any) => number }
  row: {
    id: any
    status: string | number
    type: string
    name: string
  }
}

const statusObj: {
  [key: string]: {
    title: string
    color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'
  }
} = {
  1: { title: 'current', color: 'primary' },
  2: { title: 'professional', color: 'success' },
  3: { title: 'rejected', color: 'error' },
  4: { title: 'resigned', color: 'warning' },
  5: { title: 'applied', color: 'info' }
}

const AttributeContent = () => {
  // ** States
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 7 })
  const [hideNameColumn] = React.useState({ full_name: true })
  const [pageOption, setPageOption] = useState<PageOptionRequestType>(defaultPagination)

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
        // indeterminate={isCheckboxIndeterminate()}
        // checked={checkedAll}
        // onChange={e => handleChange(e, 'all')}
        />
      )
    },
    {
      field: 'no',
      headerName: 'No',
      width: 22,
      renderCell: (index: CellType) => {
        return index.api.getRowIndexRelativeToVisibleRows(index.row.id) + 1
      }
    },

    {
      flex: 1,

      field: 'type',
      headerName: 'Type',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.['type']}
        </Typography>
      )
    },
    {
      flex: 1,

      field: 'name',
      headerName: 'Name',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.['name']}
        </Typography>
      )
    },
    {
      flex: 1,

      field: 'status',
      headerName: 'Status',
      renderCell: (params: CellType) => {
        const status = statusObj[parseInt(params.row.status as string)]

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={status.color}
            label={status.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
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
            <IconButton size='small'>
              <Icon icon='tabler:edit' fontSize='0.875rem' />
            </IconButton>
            <IconButton size='small'>
              <Icon icon='tabler:trash' fontSize='0.875rem' />
            </IconButton>
          </>
        )
      }
    }
  ]
  const [model, setModel] = React.useState(false)

  return (
    <React.Fragment>
      <TableHeader
        title='Attribute'
        onAdd={() => setModel(true)}
        onSearch={value => {
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGrid
        autoHeight
        rows={[]}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        slots={{
          pagination: () => <Pagination count={10} color='primary' shape='rounded' />
        }}
        pageSizeOptions={[7, 10, 25, 50]}
        paginationModel={paginationModel}
        columnVisibilityModel={hideNameColumn}
        onPaginationModelChange={setPaginationModel}
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
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
      />
      <AddAttribute open={model} toggle={() => setModel(false)} />
    </React.Fragment>
  )
}

export default AttributeContent
