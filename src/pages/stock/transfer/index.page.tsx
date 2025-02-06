// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

export type StockOpnameType = {
  id: number
  date: string
  date2: string
  invoiceId: string
  customerName: string
  customerName2: string
  total: number
  payment: string
  status: string
}

// ** Data Import
import { TextField, InputAdornment, IconButton, Checkbox, Tooltip } from '@mui/material'
// import { customerService } from 'src/services/customer'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
// import { toast } from 'react-hot-toast'
// import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { rangeDateValue } from 'src/utils/apiUtils'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { useAuth } from 'src/hooks/useAuth'

const today = new Date()
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const style = {
  marginRight: '15px',
  marginLeft: '15px'
}

const StockTransferPage = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  // ** States
  const [search, setSearch] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [, setOpenForm] = useState<boolean>(false)
  const [
    loadingDelete
    // setLoadingDelete
  ] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  // const { mutate: batchUpdate } = useMutation(customerService.patchBatch, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('customer-list')
  //     setDeleteBatch(false)
  //     setItemSelected([])
  //     setCheckedAll(false)
  //   }
  // })

  // const batchUpdateStatus = (status: string) => {
  //   if (itemSelected.length > 0) {
  //     batchUpdate(
  //       itemSelected.map(item => ({
  //         id: Number(item.id),
  //         status: status
  //       }))
  //     )
  //   }
  // }

  // const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
  //   customerService.deleteBatchCustomer,
  //   {
  //     onSuccess: data => {
  //       toast.success(t((data as unknown as ResponseType).data.message))
  //       queryClient.invalidateQueries('customer-list')
  //       setDeleteBatch(false)
  //       setItemSelected([])
  //       setCheckedAll(false)
  //     }
  //   }
  // )

  // ** Hooks
  const [itemsData, setItemsData] = useState<StockOpnameType[]>([])
  const [itemsMeta, setItemsMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>(defaultPagination)
  const [deleteBatch, setDeleteBatch] = useState(false)

  const dateFromQuery =
    pageOption.created_at != undefined
      ? (pageOption.created_at as string).split('~')
      : rangeDateValue(defaultStartDate, defaultEndDate).split('~')

  const defaultStartDateFromQuery = new Date(dateFromQuery[0])
  const defaultEndDateFromQuery = new Date(dateFromQuery[1])

  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(
    defaultStartDateFromQuery
  )
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(defaultEndDateFromQuery)

  useEffect(() => {
    setPageOption(old => ({
      ...old,
      created_at: rangeDateValue(startDateRange ?? defaultStartDate, endDateRange ?? defaultEndDate)
    }))
  }, [startDateRange, endDateRange])

  useEffect(() => {
    checkPermission('transfer stock.read') &&
      setItemsData([
        {
          id: 1,
          date: '15 Agu 2023',
          date2: '15 Agu 2023',
          invoiceId: 'IN001',
          customerName: 'Cikini',
          customerName2: 'Utama',
          total: 999999,
          payment: 'Cash',
          status: 'Paid'
        },
        {
          id: 2,
          date: '14 Agu 2023',
          date2: '15 Agu 2023',
          invoiceId: 'IN002',
          customerName: 'Utama',
          customerName2: 'Cikini',
          total: 999999,
          payment: 'Credit',
          status: 'Pending'
        }
      ])
    setItemsMeta(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // const { isLoading } = useQuery(['customer-list', pageOption], {
  //   queryFn: () => customerService.getListCustomer(pageOption),
  //   onSuccess: data => {
  //     setItemsData(data.data.data ?? [])
  //     setItemsMeta(data.data.meta)
  //   }
  // })

  // const deleteUserMutation = useMutation(customerService.deleteCustomer, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))

  //     queryClient.invalidateQueries('customer-list')
  //     setOpenDelete(false)
  //     setSelectedItem(null)
  //   },
  //   onSettled: () => {
  //     setLoadingDelete(false)
  //   }
  // })

  // ** Handle
  const handleDetail = (id: string | null) => {
    setOpenForm(true)
    setSelectedItem(id)
  }

  const handleCloseDeleteCustomer = () => {
    setOpenDelete(false)
    setSelectedItem(null)
  }

  const handleDelete = (id: string | null) => {
    setSelectedItem(id)
    setOpenDelete(true)
  }

  const handleConfirmDeleteCustomer = () => {
    if (selectedItem !== null) {
      // setLoadingDelete(true)
      // deleteUserMutation.mutate(selectedItem)
    }
  }

  const [itemSelected, setItemSelected] = useState<StockOpnameType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      // mutateDeleteBatch(itemSelected.map(item => parseInt(item.id)) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    customer?: StockOpnameType
  ) => {
    if (id !== 'all') {
      if (customer && event.target.checked) setItemSelected([...itemSelected, customer])
      else if (customer && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != customer.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(itemsData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<StockOpnameType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: index => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id.toString(), index.row)}
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
      width: 22,
      field: 'id',
      headerName: 'No',
      renderCell: row => (
        <Typography noWrap variant='caption'>
          {row.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'nomor',
      headerName: t('Number') ?? 'Number',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          TFR-000{params.row.id}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'date2',
      headerName: t('Date') ?? 'Date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'customerName',
      headerName: t('From') ?? 'From',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },

    {
      flex: 1,
      field: 'customerName2',
      headerName: t('To') ?? 'To',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'note',
      headerName: t('Note') ?? 'Note',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'status',
      headerName: 'Status',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <Box
            sx={{
              display: 'flex'
            }}
          >
            {checkPermission('transfer stock.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleDetail(params.row.id.toString())}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}

            {checkPermission('transfer stock.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row.id.toString())}>
                  <Icon icon='tabler:trash' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {/* <IconButton
              aria-label='more'
              id='long-button'
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup='true'
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id='basic-menu'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu> */}
          </Box>
        )
      }
    }
  ]

  // Horizontal Scrollbar Table in Pagination
  const setBottomScrollEl = useSetAtom(bottomScrollElAtom)
  const setBottomWrapScrollWidth = useSetAtom(bottomWrapScrollWidthAtom)

  const gridRef = useGridApiRef()
  const dataGridRef = useRef<HTMLDivElement | null>(null)
  const onResize = (containerSize: ElementSize) => {
    setBottomWrapScrollWidth(containerSize.width)
    if (dataGridRef.current) {
      const el = dataGridRef.current.getElementsByClassName('MuiDataGrid-virtualScrollerContent')
      if (el.length > 0) setBottomScrollEl(el[0])
    }
  }

  return (
    <Card
      sx={{
        mb: 10
      }}
    >
      <CardHeader
        sx={{
          alignItems: 'flex-start !important',
          flex: 'unset',
          '& .MuiCardHeader-action': {
            width: '100%'
          }
        }}
        action={
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <TextField
              label={t('Search') + ' ' + t('Transfer Stock') + '...'}
              variant='outlined'
              size='small'
              sx={{ marginRight: style.marginRight }}
              value={search}
              onChange={e => {
                setSearch(e.target.value ?? '')
                setPageOption({ ...pageOption, query: e.target.value ?? '' })
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Icon fontSize='1.125rem' icon='tabler:search' />
                  </InputAdornment>
                )
              }}
            />
            <PickersRangeMonth
              label='Date'
              startDate={startDateRange}
              endDate={endDateRange}
              defaultStartDate={defaultStartDate}
              defaultEndDate={defaultEndDate}
              onChangeDateRange={(start, end) => {
                if (start && end) {
                  setStartDateRange(start)
                  setEndDateRange(end)
                }

                if (start == null && end == null) {
                  setStartDateRange(defaultStartDate)
                  setEndDateRange(defaultEndDate)
                }
              }}
            />
            <div>
              <Button
                sx={{ marginRight: style.marginRight, marginLeft: style.marginLeft }}
                variant='outlined'
                onClick={() => {
                  setSearch('')
                  setStartDateRange(defaultStartDate)
                  setEndDateRange(defaultEndDate)
                  setPageOption({ ...pageOption, query: '', membership_id: '' })
                }}
              >
                Reset
              </Button>
            </div>

            {checkPermission('transfer stock.create') && (
              <div style={{ marginLeft: 'auto' }}>
                <Link href='/stock/transfer/add'>
                  <Button variant='contained' startIcon={<Icon icon={'tabler:plus'} />}>
                    {t('Transfer Stock')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        }
      />
      <DataGrid
        sx={{
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            display: 'none'
          }
        }}
        ref={dataGridRef}
        apiRef={gridRef}
        onResize={onResize}
        // loading={isLoading}
        autoHeight
        rows={itemsData}
        columns={columns}
        disableColumnMenu
        hideFooter
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={itemsMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        onDeleteButton={() => setDeleteBatch(true)}
      />

      <DialogConfirmation
        open={openDelete}
        handleClose={handleCloseDeleteCustomer}
        handleConfirm={handleConfirmDeleteCustomer}
        loading={loadingDelete}
        name='Transfer Stock'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={false}
        // loading={isLoadingDeleteBatch}
        name='Transfer Stock'
      />
    </Card>
  )
}

export default StockTransferPage
