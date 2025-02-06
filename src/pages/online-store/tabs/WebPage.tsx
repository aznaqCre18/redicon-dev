import React, { useState } from 'react'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Pagination, Box } from '@mui/material'
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import FormWebPage from './dialog/FormWebPage'
import { useTranslation } from 'react-i18next'

interface CellType {
  api: { getRowIndexRelativeToVisibleRows: (arg0: any) => number }
  row: {
    id: any
    status: string | number
    title: string
    detail: string
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

const WebPageComponent = () => {
  const { t } = useTranslation()
  // ** States
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 7 })
  const [hideNameColumn] = React.useState({ full_name: true })

  const columns: GridColDef[] = [
    {
      field: 'no',
      headerName: 'No',
      width: 50,
      renderCell: (index: CellType) => {
        return index.api.getRowIndexRelativeToVisibleRows(index.row.id) + 1
      }
    },

    {
      flex: 1,
      minWidth: 150,
      field: 'title',
      headerName: 'Name',
      renderCell: () => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {/* {params.row?.['vendor-name']} */}Title
        </Typography>
      )
    },

    {
      flex: 1,
      minWidth: 150,
      field: 'updated_at',
      headerName: 'Last Change',
      renderCell: () => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {/* {params.row?.['vendor-name']} */}
          Details
        </Typography>
      )
    },

    {
      flex: 1,
      minWidth: 150,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openForm, setOpenForm] = useState(false)

  const handleAdd = () => {
    setOpenForm(true)
  }

  const handleCloseFormDialog = () => {
    setOpenForm(false)
    // setSelectedData(null)
  }

  return (
    <Box
      sx={{
        mb: '50px'
      }}
    >
      <TableHeader title='Web Page' onAdd={handleAdd} />
      <DataGridCustom
        autoHeight
        rows={[]}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        checkboxSelection
        slots={{
          pagination: () => <Pagination count={10} color='primary' />
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
        onChangePagination={() => {
          console.log('change')
        }}
      />
      <FormWebPage
        // selectBanner={selectedData}
        open={openForm}
        toggle={handleCloseFormDialog}
        // setSelectBanner={setSelectedData}
      />
    </Box>
  )
}

export default WebPageComponent
