// ** React Imports
import { ChangeEvent, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

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
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material'
import FormCustomerDialog from './components/FormCustomerDialog'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { customerService } from 'src/services/customer'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import {
  PageOptionRequestType,
  defaultPaginationDesc,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { membershipService } from 'src/services/membership'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { CustomerDetailType } from 'src/types/apps/customerType'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { employeeService } from 'src/services/employee'
import { devMode } from 'src/configs/dev'
import { EmployeeType } from 'src/types/apps/employee'
import DialogSearchCustomerTopUp from './components/dialogs/DialogSearchCustomerTopUp'
import { useDisclosure } from 'src/hooks/useDisclosure'
import Link from 'next/link'

// ** renders client column
const renderClient = (params: { row: CustomerDetailType }) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states: ('success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined)[] =
    ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined =
    states[stateNum]

  return (
    <CustomAvatar
      skin='light'
      color={color}
      sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      src={row.customer.profile_picture ? getImageAwsUrl(row.customer.profile_picture) : ''}
    >
      {getInitials(row.customer.name ? row.customer.name : 'John Doe')}
    </CustomAvatar>
  )
}

const Customer = () => {
  const { checkPermission, user } = useAuth()
  const vendorId = user?.user.vendor_id

  const { t } = useTranslation()
  const router = useRouter()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPaginationDesc,
    order: 'created_at',
    ...router.query
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
  const [filterMembership, setFilterMembership] = useState<string>(
    (pageOption.membership_id as any) ?? '0'
  )
  const [filterEmployee, setFilterEmployee] = useState<string>(
    (pageOption.employee_id as any) ?? '0'
  )

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailType | null>(null)
  const [addCustomerOpen, setAddCustomerOpen] = useState<boolean>(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [deleteCustomer, setDeleteCustomer] = useState(false)

  // top up dialog
  const {
    isOpen: isOpenSearchCustomerTopUp,
    onOpen: onOpenSearchCustomerTopUp,
    onClose: onCloseSearchCustomerTopUp
  } = useDisclosure()

  const [topUpNextStep, setTopUpNextStep] = useState<'top-up' | 'check-balance'>('top-up')

  const handleTopUp = (nextStep: 'top-up' | 'check-balance') => {
    setTopUpNextStep(nextStep)
    onOpenSearchCustomerTopUp()
  }

  const handleCheckBalance = () => {
    handleTopUp('check-balance')
  }

  const handleTopUpBalance = () => {
    handleTopUp('top-up')
  }

  const { data: dataMembership } = useQuery(['membership-list-active'], {
    queryFn: () =>
      membershipService.getList({
        is_active: 'true',
        ...maxLimitPagination
      })
  })

  const [dataEmployee, setDataEmployee] = useState<EmployeeType[]>([])

  useQuery(['employee-list'], {
    queryFn: () =>
      employeeService.getList({
        ...maxLimitPagination
      }),
    onSuccess: data => {
      setDataEmployee(data.data.data ?? [])
    }
  })

  const { mutate: batchUpdate } = useMutation(customerService.patchBatch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('customer-list')
      setDeleteBatch(false)
      setItemSelected([])
      setCheckedAll(false)
    }
  })

  const batchUpdateStatus = (status: string) => {
    if (itemSelected.length > 0) {
      batchUpdate(
        itemSelected.map(item => ({
          id: Number(item.customer.id),
          status: status
        }))
      )
    }
  }

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    customerService.deleteBatchCustomer,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('customer-list')
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const toggleAddCustomerDrawer = () => setAddCustomerOpen(!addCustomerOpen)

  // ** Hooks
  const [customersData, setCustomersData] = useState<CustomerDetailType[]>([])
  const [customerMeta, setCsutomerMeta] = useState<MetaType>()
  const [deleteBatch, setDeleteBatch] = useState(false)

  const queryClient = useQueryClient()
  const { isLoading } = useQuery(['customer-list', pageOption], {
    queryFn: () => customerService.getListDetailCustomer(pageOption),
    enabled: checkPermission('customer.read'),
    onSuccess: data => {
      setCustomersData(data.data.data ?? [])
      setCsutomerMeta(data.data.meta)
    }
  })

  const deleteUserMutation = useMutation(customerService.deleteCustomer, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('customer-list')
      setDeleteCustomer(false)
      setSelectedCustomer(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  // ** Handle
  const handleDetail = (data: CustomerDetailType | null) => {
    setAddCustomerOpen(true)
    setSelectedCustomer(data)
  }

  const handleCloseDeleteCustomer = () => {
    setDeleteCustomer(false)
    setSelectedCustomer(null)
  }

  const handleDelete = (data: CustomerDetailType | null) => {
    setSelectedCustomer(data)
    setDeleteCustomer(true)
  }

  const handleConfirmDeleteCustomer = () => {
    if (selectedCustomer !== null) {
      setLoadingDelete(true)
      deleteUserMutation.mutate(selectedCustomer.customer.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<CustomerDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => parseInt(item.customer.id)) as number[])
    }
  }

  const { mutate: exportExcel } = useMutation(customerService.exportExcel, {
    onSuccess: data => {
      const url = window.URL.createObjectURL(new Blob([data.data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'customers.xlsx')
      link.click()

      toast.success(t('Success download file'))
    }
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    customer?: CustomerDetailType
  ) => {
    if (id !== 'all') {
      if (customer && event.target.checked) setItemSelected([...itemSelected, customer])
      else if (customer && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.customer.id != customer.customer.id))

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

  const { mutate: setStatus } = useMutation(customerService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('customer-list')
    }
  })

  const setStatusCustomer = (id: number, status: string) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<CustomerDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.customer.id, index.row)}
            key={index.row.customer.id}
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
        // get shortable
        const isIdShortableDesc = (pageOption.order == 'id' && pageOption.sort == 'asc') || false

        return (
          (isIdShortableDesc ? customerMeta!.total_count + 1 : 0) +
          (isIdShortableDesc ? -1 : 1) *
            ((index.api.getRowIndexRelativeToVisibleRows(index.row.customer.id) ?? 1) +
              1 +
              (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1))
        )
      }
    },
    {
      field: 'code',
      sortable: false,
      headerName: t('Code') ?? 'Code',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.customer.code}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'name',
      headerName: t('Requestor') ?? 'Requestor',
      renderCell: (params: { row: CustomerDetailType }) => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                className='hover-underline'
                onClick={() => handleDetail(params.row)}
                noWrap
                variant='body2'
                sx={{
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                {row.customer.name}
              </Typography>
              <Typography noWrap variant='caption'>
                {row.customer.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'phone',
      minWidth: 80,
      headerName: t('Phone Number') ?? 'Phone Number',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.customer.phone}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'membership',
      headerName: t('Membership') ?? 'Membership',
      renderCell: params => params.row.membership.name ?? '-'
    },
    // {
    //   flex: 1,
    //   field: 'employee_name',
    //   headerName: t('Employee') ?? 'Employee',
    //   renderCell: (params: any) => params.row.customer.employee_name ?? '-'
    // },
    {
      flex: 1,
      minWidth: 110,
      field: 'address',
      headerName: t('Location') ?? 'Location',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.address.length > 0
            ? `${params.row.address[0].district.name}, ${params.row.address[0].province.name}`
            : '-'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.customer.status == 'Active'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('customer.update') &&
                  setStatusCustomer(
                    parseInt(params.row.customer.id),
                    event.target.checked ? 'Active' : 'Inactive'
                  )
              }}
            />
          }
          label={params.row.customer.status == 'Active' ? t('Active') : t('Disable')}
        />
      )
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        // const { row } = params

        return (
          <Box
            sx={{
              display: 'flex'
            }}
          >
            {checkPermission('customer.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleDetail(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('customer.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row)}>
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
            {/* <MenuOptionAction data={row} /> */}
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
        mb: '50px'
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
              label={(t('Search') ?? 'Search') + ' ' + (t('Requestor') ?? 'Requestor') + '...'}
              variant='outlined'
              size='small'
              sx={{ marginRight: 1 }}
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
            <FormControl
              size='small'
              sx={{
                width: '200px',
                mr: 1
              }}
            >
              <InputLabel id='demo-simple-select-label'>{t('Membership')}</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                label={t('Membership')}
                value={filterMembership}
                onChange={event => {
                  setPageOption({
                    ...pageOption,
                    membership_id:
                      event.target.value ?? event.target.value != 0 ? event.target.value : ''
                  })
                  setFilterMembership(event.target.value)
                }}
              >
                <MenuItem value={0}>{t('All')}</MenuItem>

                {(dataMembership?.data.data ?? []).map((membership, index) => (
                  <MenuItem value={membership.id} key={index}>
                    {membership.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* <FormControl
              size='small'
              sx={{
                width: '200px'
              }}
            >
              <InputLabel id='demo-simple-select-label'>{t('Employee')}</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                label={t('Employee')}
                value={filterEmployee}
                onChange={event => {
                  setPageOption({
                    ...pageOption,
                    employee_id:
                      event.target.value ?? event.target.value != 0 ? event.target.value : ''
                  })
                  setFilterEmployee(event.target.value)
                }}
              >
                <MenuItem value={0}>{t('All')}</MenuItem>

                {dataEmployee.map((employee, index) => (
                  <MenuItem value={employee.id} key={index}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}

            {/* <div>
                <Button sx={{ marginRight: style.marginRight, marginLeft: style.marginLeft }} variant='contained'>
                  <Typography variant='body2' sx={{ color: 'white' }}>
                    Search
                  </Typography>
                </Button>
              </div> */}
            <div>
              <Button
                sx={{ marginRight: 1, marginLeft: 1 }}
                variant='outlined'
                onClick={() => {
                  setSearch('')
                  setPageOption({ ...pageOption, query: '', membership_id: '' })
                  setFilterEmployee('0')
                  setFilterMembership('0')
                }}
              >
                Reset
              </Button>
            </div>
            <Box ml={'auto'} display={'flex'} columnGap={2}>
              {(devMode || vendorId == 69) && (
                <>
                  <Button variant='outlined' onClick={handleCheckBalance}>
                    {t('Check Balance')}
                  </Button>
                  <Button variant='outlined' onClick={handleTopUpBalance}>
                    {t('Top Up')}
                  </Button>
                </>
              )}
              {/* <Button
                variant='outlined'
                onClick={() => exportExcel()}
                startIcon={<Icon icon='file-icons:microsoft-excel' />}
              >
                {t('Export')}
              </Button> */}
              <Link href='/customer/membership'>
                <Button variant='outlined'>Membership</Button>
              </Link>
              {checkPermission('customer.create') && (
                <Button
                  variant='contained'
                  startIcon={<Icon icon={'tabler:plus'} />}
                  onClick={() => {
                    setAddCustomerOpen(true)
                  }}
                >
                  {t('Requestor')}
                </Button>
              )}
            </Box>
          </div>
        }
      />
      <DataGridCustom
        sx={{
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            display: 'none'
          }
        }}
        getRowId={param => param.customer.id}
        ref={dataGridRef}
        apiRef={gridRef}
        onResize={onResize}
        loading={isLoading}
        autoHeight
        rows={customersData}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={customerMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('customer.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
        {...(checkPermission('customer.update') && {
          button: (
            <>
              {itemSelected.filter(item => item.customer.status == 'Inactive').length > 0 && (
                <Button
                  color='success'
                  variant='contained'
                  onClick={() => batchUpdateStatus('Active')}
                >
                  Active
                </Button>
              )}
              {itemSelected.filter(item => item.customer.status == 'Active').length > 0 && (
                <Button
                  color='warning'
                  variant='contained'
                  onClick={() => batchUpdateStatus('Inactive')}
                >
                  Deactive
                </Button>
              )}
            </>
          )
        })}
      />

      <FormCustomerDialog
        open={addCustomerOpen}
        toggle={toggleAddCustomerDrawer}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />
      <DialogConfirmation
        open={deleteCustomer}
        handleClose={handleCloseDeleteCustomer}
        handleConfirm={handleConfirmDeleteCustomer}
        name='Customer'
        loading={loadingDelete}
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        name='Customer'
        loading={isLoadingDeleteBatch}
      />
      <DialogSearchCustomerTopUp
        open={isOpenSearchCustomerTopUp}
        onClose={onCloseSearchCustomerTopUp}
        nextStep={topUpNextStep}
      />
    </Card>
  )
}

export default Customer
