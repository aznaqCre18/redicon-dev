import { Box, Checkbox, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import React, { useState } from 'react'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'

type ChannelType = {
  id: number
  name: string
  channel: string
  status: string
  auth_date: Date
  expired_date: Date
  validation_day: string
}

interface CellType {
  api: { getRowIndexRelativeToVisibleRows: (arg0: any) => number }
  row: ChannelType
}

const StoreTable = () => {
  // ** Hooks
  const [customersData] = useState<ChannelType[]>([])
  const [customerMeta] = useState<MetaType>()
  const [paginationData, setPaginationData] = useState<PageOptionRequestType>(defaultPagination)
  // const { isLoading } = useQuery(['customer-list'], {
  //   queryFn: () => customerService.getListCustomer(paginationData),
  //   onSuccess: data => {
  //     setCustomersData(data.data.data)
  //     setCsutomerMeta(data.data.meta)
  //   }
  // })

  const [itemSelected, setItemSelected] = useState<ChannelType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    customer?: ChannelType
  ) => {
    if (id !== 'all') {
      if (customer && event.target.checked) setItemSelected([...itemSelected, customer])
      else if (customer && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != customer.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(customersData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef[] = [
    {
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
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id, index.row)}
            key={index.row.id}
          />
        )
      },
      sortable: false,
      renderHeader: () => (
        <Checkbox
          indeterminate={isCheckboxIndeterminate()}
          checked={checkedAll}
          onChange={e => handleChange(e, 'all')}
        />
      )
    },
    {
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
      flex: 0.25,
      minWidth: 290,
      field: 'name',
      headerName: 'Name',
      renderCell: (params: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {params.row.name}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      field: 'channel',
      minWidth: 80,
      headerName: 'Channel',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.channel}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'status',
      minWidth: 80,
      headerName: 'Status',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.status}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'auth_date',
      minWidth: 80,
      headerName: 'Berlaku Sampai',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.auth_date.toDateString()}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'expired_date',
      minWidth: 80,
      headerName: 'Berlaku Sampai',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.expired_date.toDateString()}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'validation_day',
      minWidth: 80,
      headerName: 'Hari Validitas',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.validation_day}
        </Typography>
      )
    },
    {
      flex: 0.125,
      minWidth: 140,
      field: 'action',
      headerName: 'Tipe Operasi'
    }
  ]

  return (
    <div>
      <DataGrid autoHeight rows={customersData} columns={columns} disableColumnMenu hideFooter />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={customerMeta}
        onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
      />
    </div>
  )
}

export default StoreTable
