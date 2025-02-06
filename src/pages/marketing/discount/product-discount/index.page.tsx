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

// ** Data Import
import {
  Select,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  IconButton,
  Checkbox,
  Tooltip,
  Tab
} from '@mui/material'
import { useQuery } from 'react-query'
// import { customerService } from 'src/services/customer'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
// import { toast } from 'react-hot-toast'
// import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { membershipService } from 'src/services/membership'
import { ProductDiscountType } from 'src/types/apps/promotion'
import { TabContext, TabList } from '@mui/lab'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import PickerDate from 'src/components/form/datepicker/PickerDate'

const style = {
  marginRight: '15px',
  marginLeft: '15px'
}

const ProductDiscount = () => {
  const { t } = useTranslation()

  // ** States
  const [search, setSearch] = useState<string>('')
  const [filterDate, setFilterDate] = useState<DateType>(new Date())
  const [filterStore, setFilterStore] = useState<string>('0')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [, setOpenForm] = useState<boolean>(false)
  const [
    loadingDelete
    // setLoadingDelete
  ] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const { data: dataStore } = useQuery(['store-list-active'], {
    queryFn: () =>
      membershipService.getList({
        is_active: 'true',
        ...defaultPagination
      })
    // onSuccess: data => {
    //   if (data.data.data) {
    //     if (data.data.data.length > 0) setValue('membership_id', data.data.data[0].id)
    //   }
    // }
  })

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
  const [tabValue, setTabValue] = useState('1')
  const [itemsData, setItemsData] = useState<ProductDiscountType[]>([])
  const [itemsMeta, setItemsMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>(defaultPagination)
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    setItemsData([
      {
        id: 1,
        created_at: '20 Nov 2023, 14:02',
        period_start: '20 Nov 2023, 14:02',
        period_end: '24 Nov 2023, 18:00',
        name: 'Discount Lebaran',
        store_id: 'Lucky Store',
        outlet_id: 'Outlet 01',
        status: 'Live'
      },
      {
        id: 2,
        created_at: '20 Nov 2023, 14:02',
        period_start: '20 Nov 2023, 14:02',
        period_end: '24 Nov 2023, 18:00',
        name: 'Discount Lebaran',
        store_id: 'Lucky Store',
        outlet_id: 'Outlet 01',
        status: 'Expired'
      },
      {
        id: 3,
        created_at: '20 Nov 2023, 14:02',
        period_start: '20 Nov 2023, 14:02',
        period_end: '24 Nov 2023, 18:00',
        name: 'Discount Lebaran',
        store_id: 'Lucky Store',
        outlet_id: 'Outlet 01',
        status: 'Scheduled'
      }
    ])
    setItemsMeta(undefined)
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

  const [itemSelected, setItemSelected] = useState<ProductDiscountType[]>([])
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
    customer?: ProductDiscountType
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

  const columns: GridColDef<ProductDiscountType>[] = [
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
      flex: 1,
      field: 'created_at',
      headerName: 'Date Create',
      renderCell: row => (
        <Typography noWrap variant='caption'>
          {row.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'period_start',
      headerName: 'Period Start',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'period_end',
      headerName: 'Period End',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'name',
      headerName: 'Name',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'store_id',
      headerName: 'Store',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'outlet_id',
      headerName: 'Outlet',
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
            <Tooltip title='Edit' placement='top'>
              <IconButton size='small' onClick={() => handleDetail(params.row.id.toString())}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete' placement='top'>
              <IconButton size='small' onClick={() => handleDelete(params.row.id.toString())}>
                <Icon icon='tabler:trash' fontSize='0.875rem' />
              </IconButton>
            </Tooltip>
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
    <div>
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
                label='Search'
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
              <PickerDate
                label='Date'
                onSelectDate={date => {
                  setFilterDate(date)
                }}
                value={filterDate}
              />
              <FormControl
                size='small'
                sx={{
                  width: '200px'
                }}
              >
                <InputLabel id='demo-simple-select-label'>Store</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  label='Store'
                  sx={{ marginRight: style.marginRight }}
                  value={filterStore}
                  onChange={event => {
                    setPageOption({
                      ...pageOption,
                      membership_id:
                        event.target.value ?? event.target.value != 0 ? event.target.value : ''
                    })
                    setFilterStore(event.target.value)
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>

                  {(dataStore?.data.data ?? []).map((membership, index) => (
                    <MenuItem value={membership.id} key={index}>
                      {membership.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                size='small'
                sx={{
                  width: '200px'
                }}
              >
                <InputLabel id='demo-simple-select-label'>Outlet</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  label='Store'
                  value={filterStore}
                  onChange={event => {
                    setPageOption({
                      ...pageOption,
                      membership_id:
                        event.target.value ?? event.target.value != 0 ? event.target.value : ''
                    })
                    setFilterStore(event.target.value)
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>

                  {(dataStore?.data.data ?? []).map((membership, index) => (
                    <MenuItem value={membership.id} key={index}>
                      {membership.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* <div>
                <Button sx={{ marginRight: style.marginRight, marginLeft: style.marginLeft }} variant='contained'>
                  <Typography variant='body2' sx={{ color: 'white' }}>
                    Search
                  </Typography>
                </Button>
              </div> */}
              <div>
                <Button
                  sx={{ marginRight: style.marginRight, marginLeft: style.marginLeft }}
                  variant='outlined'
                  onClick={() => {
                    setSearch('')
                    setPageOption({ ...pageOption, query: '', membership_id: '' })
                    setFilterStore('0')
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          }
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            mr: 2
          }}
        >
          <TabContext value={tabValue}>
            <TabList onChange={(e, value) => setTabValue(value)}>
              <Tab value={'1'} label='All' />
              <Tab value={'2'} label='Live' />
              <Tab value={'3'} label='Scheduled' />
              <Tab value={'4'} label='Expired' />
            </TabList>
          </TabContext>
          <div style={{ marginLeft: 'auto' }}>
            <Link href='/marketing/discount/product-discount/add'>
              <Button variant='contained' startIcon={<Icon icon={'tabler:plus'} />}>
                Product Discount
              </Button>
            </Link>
          </div>
        </Box>

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
          name='Product Discount'
        />
        <DialogConfirmation
          open={deleteBatch}
          handleClose={() => setDeleteBatch(false)}
          handleConfirm={handleConfirmDeleteBatch}
          loading={false}
          name='Product Discount'
          // loading={isLoadingDeleteBatch}
        />
      </Card>
    </div>
  )
}

export default ProductDiscount
