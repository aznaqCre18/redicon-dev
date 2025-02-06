// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

// ** Data Import
import {
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  Tooltip,
  FormControl
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
// import { toast } from 'react-hot-toast'
// import { ResponseType } from 'src/types/response/response'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import Link from 'next/link'
import { outletService } from 'src/services/outlet/outlet'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { purchaseService } from 'src/services/purchase/purchase'
import { PurchaseDetailType } from 'src/types/apps/purchase/purchase'
import { formatDate } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import DataGridCustom from 'src/components/table/DataGridCustom'
import DialogDetailPurchaseInvoice from 'src/components/dialog/DialogDetailPurchaseInvoice'
import DialogPrintPurchaseInvoice from 'src/components/dialog/DialogPrintPurchaseInvoice'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { rangeDateValue } from 'src/utils/apiUtils'
import { useAuth } from 'src/hooks/useAuth'

const today = new Date()
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const Purchase = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query,
    sort: 'desc'
  } as any)

  useEffect(() => {
    router.replace({
      query: pageOption
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  // ** States
  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [openDetailDialog, setOpenDetailDialog] = useState<boolean>(false)
  const [openPrintDialog, setOpenPrintDialog] = useState<string | undefined>(undefined)
  const [loadingDelete, setLoadingDelete] = useState(false)
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
  const [itemsData, setItemsData] = useState<PurchaseDetailType[]>([])
  const [itemsMeta, setItemsMeta] = useState<MetaType>()
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

  const [outletFilterVal, setOutletFilterVal] = useState<number | null>(
    (pageOption.outlet_id as any) ?? null
  )

  const [outletData, setOutletData] = useState<OutletType[]>([])

  useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data ?? [])
    }
  })

  useEffect(() => {
    setPageOption(old => ({ ...old, outlet_id: outletFilterVal }))
  }, [outletFilterVal])

  const { isLoading } = useQuery(['purchase-list', pageOption], {
    queryFn: () => purchaseService.getList(pageOption),
    enabled: checkPermission('purchase.read'),
    onSuccess: data => {
      setItemsData(data.data.data ?? [])
      setItemsMeta(data.data.meta)
    }
  })

  const queryClient = useQueryClient()

  const deleteDataMutation = useMutation(purchaseService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('purchase-list')
      setOpenDelete(false)
      setSelectedItem(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  const handlePrint = (id: string | undefined) => {
    setOpenPrintDialog(id)
  }

  const handleDetail = (id: string | null) => {
    setOpenDetailDialog(true)
    setSelectedItem(id)
  }

  const handleCloseDeleteData = () => {
    setOpenDelete(false)
    setSelectedItem(null)
  }

  const handleDelete = (id: string | null) => {
    setSelectedItem(id)
    setOpenDelete(true)
  }

  const handleConfirmDeleteData = () => {
    if (selectedItem !== null) {
      setLoadingDelete(true)
      deleteDataMutation.mutate(selectedItem)
    }
  }

  const [itemSelected, setItemSelected] = useState<PurchaseDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleConfirmData = () => {
    if (itemSelected.length > 0) {
      // mutateDeleteBatch(itemSelected.map(item => parseInt(item.id)) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    purchase?: PurchaseDetailType
  ) => {
    if (id !== 'all') {
      if (purchase && event.target.checked) setItemSelected([...itemSelected, purchase])
      else if (purchase && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != purchase.id))

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

  const columns: GridColDef<PurchaseDetailType>[] = [
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
      headerName: t('No') ?? 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'created_at',
      headerName: t('Date') ?? 'Date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatDate(params.value)}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'purchase_number',
      headerName: t('Purchase Number') ?? 'Purchase Number',
      renderCell: params => (
        <Typography
          variant='body2'
          sx={{
            color: 'primary.main',
            fontWeight: 600
          }}
          className='hover-underline'
          onClick={() => handleDetail(params.row.id.toString())}
        >
          {params.value}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'supplier_id',
      headerName: t('Vendor') ?? 'Vendor',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.supplier.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'grand_total',
      headerName: 'Total',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatPriceIDR(params.value)}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'payment_status',
      headerName: t('Status') ?? 'Status',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    }
    // currently not used
    // {
    //   cellClassName: 'column-action',
    //   width: 100,
    //   sortable: false,
    //   field: 'action',
    //   headerName: t('Action') ?? 'Action',
    //   renderCell: params => {
    //     return (
    //       <Box
    //         sx={{
    //           display: 'flex'
    //         }}
    //       >
    //         <Tooltip title={t('Print')} placement='top'>
    //           <IconButton size='small' onClick={() => handlePrint(params.row.id.toString())}>
    //             <Icon icon='mingcute:print-fill' fontSize='0.875rem' />
    //           </IconButton>
    //         </Tooltip>
    //         <Tooltip title='Detail' placement='top'>
    //           <IconButton size='small' onClick={() => handleDetail(params.row.id.toString())}>
    //             <Icon icon='tabler:eye' fontSize='0.875rem' />
    //           </IconButton>
    //         </Tooltip>
    //         {checkPermission('purchase.update') && (
    //           <Tooltip title={t('Edit')} placement='top'>
    //             <IconButton
    //               size='small'
    //               component={Link}
    //               href={`/purchase/data/edit/${params.row.id}`}
    //             >
    //               <Icon icon='tabler:edit' fontSize='0.875rem' />
    //             </IconButton>
    //           </Tooltip>
    //         )}

    //         {checkPermission('purchase.delete') && (
    //           <Tooltip title={t('Delete')} placement='top'>
    //             <IconButton size='small' onClick={() => handleDelete(params.row.id.toString())}>
    //               <Icon icon='tabler:trash' fontSize='0.875rem' />
    //             </IconButton>
    //           </Tooltip>
    //         )}
    //         {/* <IconButton
    //           aria-label='more'
    //           id='long-button'
    //           aria-controls={open ? 'long-menu' : undefined}
    //           aria-expanded={open ? 'true' : undefined}
    //           aria-haspopup='true'
    //           onClick={handleClick}
    //         >
    //           <MoreVertIcon />
    //         </IconButton>
    //         <Menu
    //           id='basic-menu'
    //           anchorEl={anchorEl}
    //           open={open}
    //           onClose={handleClose}
    //           MenuListProps={{
    //             'aria-labelledby': 'basic-button'
    //           }}
    //         >
    //           <MenuItem onClick={handleClose}>Profile</MenuItem>
    //           <MenuItem onClick={handleClose}>My account</MenuItem>
    //           <MenuItem onClick={handleClose}>Logout</MenuItem>
    //         </Menu> */}
    //       </Box>
    //     )
    //   }
    // }
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
          padding: '16px',
          '& .MuiCardHeader-action': {
            width: '100%'
          }
        }}
        action={
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <TextField
              label={`${t('Search')} ${t('Good Receipt')}...`}
              variant='outlined'
              size='small'
              sx={{ marginRight: 2 }}
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

            {outletData && outletData.length > 1 && (
              <FormControl size='small' sx={{ marginBottom: '10px', width: '150px', pl: 2 }}>
                <SelectCustom
                  isFloating
                  value={outletFilterVal}
                  onSelect={outlet => {
                    setOutletFilterVal(outlet?.id ?? null)
                  }}
                  minWidthPaper={280}
                  optionKey={'id'}
                  labelKey={'name'}
                  label='Outlet'
                  options={outletData ?? []}
                  {...(outletData.length == 1 && {
                    defaultValueId: outletData[0]
                  })}
                />
              </FormControl>
            )}
            <Box ml={2}>
              <Button
                variant='outlined'
                onClick={() => {
                  setOutletFilterVal(null)
                  setStartDateRange(defaultStartDate)
                  setEndDateRange(defaultEndDate)
                  setSearch('')
                  setPageOption({ ...pageOption, query: '' })
                }}
              >
                Reset
              </Button>
            </Box>

            {checkPermission('purchase.create') && (
              <div style={{ marginLeft: 'auto' }}>
                <Link href='/goods-receipt/add'>
                  <Button variant='contained' startIcon={<Icon icon={'tabler:plus'} />}>
                    {t('Good Receipt')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        }
      />
      <DataGridCustom
        loading={isLoading}
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
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={itemsMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('purchase.delete') && {
          onDelete: () => setDeleteBatch(true)
        })}
      />
      <DialogConfirmation
        open={openDelete}
        handleClose={handleCloseDeleteData}
        handleConfirm={handleConfirmDeleteData}
        loading={loadingDelete}
        name='Purchase'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmData}
        loading={false}
        // loading={isLoadingDeleteBatch}
        name='Purchase'
      />
      <DialogDetailPurchaseInvoice
        type='purchase'
        title={t('Purchase Detail')}
        open={openDetailDialog}
        toggle={() => setOpenDetailDialog(!openDetailDialog)}
        id={selectedItem}
      />
      <DialogPrintPurchaseInvoice
        type='purchase'
        onClose={() => setOpenPrintDialog(undefined)}
        id={openPrintDialog}
      />
    </Card>
  )
}

export default Purchase
