import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
  Typography
} from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { ChangeEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import CourierOutletDialog from '../dialog/CourierOutletDialog'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { CourierOutletDetailType, CourierOutletType } from 'src/types/apps/vendor/courierOutlet'
import { courierOutletService } from 'src/services/vendor/courierOutlet'
import { courierService } from 'src/services/vendor/courier'
import { CourierType } from 'src/types/apps/vendor/courier'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const CourierOutletTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  // TABLE

  const [selectedData, setSelectedData] = useState<CourierOutletType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [courierId, setCourierId] = useState<number | undefined>(undefined)
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    order: 'created_at',
    ...router.query
  } as any)
  const [courierDatas, setCourierDatas] = useState<CourierType[]>([])
  const [datas, setDatas] = useState<CourierOutletDetailType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'courier-outlet'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // ** Query
  useQuery(['courier-list', pageOption], {
    queryFn: () => courierService.getList(pageOption),
    onSuccess: data => {
      setCourierDatas(data.data.data ?? [])

      if (data.data.data && data.data.data.length > 0) setCourierId(data.data.data[0].id)

      setDataMeta(data.data.meta)
    }
  })

  const { mutate: getCourierOutlet } = useMutation(courierOutletService.getList, {
    onSuccess: data => {
      console.log('data', data.data.data)

      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    }
  })

  useEffect(() => {
    if (courierId) {
      getCourierOutlet({
        id: courierId,
        options: pageOption
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierId, pageOption])

  const refreshData = () => {
    if (courierId)
      getCourierOutlet({
        id: courierId,
        options: pageOption
      })
  }

  const { mutate, isLoading } = useMutation(courierOutletService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refreshData()
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleEdit = (data: CourierOutletType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: CourierOutletType) => {
    setSelectedData(data)
    setDeleteData(true)
  }

  const handleCloseDeleteCategory = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (selectedData !== null) {
      mutate(selectedData.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<CourierOutletDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    courierOutletService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refreshData()
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.vendor_courier_detail.id) as number[])
    }
  }

  const { mutate: setStatus } = useMutation(courierOutletService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refreshData()
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const { mutate: setBatchStatus } = useMutation(courierOutletService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refreshData()
    }
  })

  const setBatchStatusCourierOutlet = (status: boolean) => {
    const ids = itemSelected.map(item => item.vendor_courier_detail.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | 'all',
    data?: CourierOutletDetailType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(
          itemSelected.filter(
            item => item.vendor_courier_detail.id != data.vendor_courier_detail.id
          )
        )

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<CourierOutletDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.vendor_courier_detail.id, index.row)}
            key={index.row.vendor_courier_detail.id}
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
      field: 'no',
      headerName: t('No') ?? 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.vendor_courier_detail.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'outlet_name',
      headerName: t('Outlet Name') ?? 'Outlet Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row.vendor_courier_detail)}
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {params.row.vendor_courier_detail.outlet_name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'location',
      headerName: t('Location') ?? 'Location',
      renderCell: index => index.row.address.district.name + ', ' + index.row.address.province.name
    },
    {
      flex: 1,
      field: 'Tarif',
      headerName: t('Rate') ?? 'Rate',
      renderCell: index => formatPriceIDR(index.row.vendor_courier_detail.price)
    },
    {
      flex: 1,
      field: 'Berat',
      headerName: t('Weight') ?? 'Weight',
      renderCell: index =>
        index.row.vendor_courier_detail.weight_from +
        ' - ' +
        index.row.vendor_courier_detail.weight_to +
        ' Gram'
    },
    {
      field: 'status',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.vendor_courier_detail.status == 'Active'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setStatusData(params.row.vendor_courier_detail.id, event.target.checked)
              }}
            />
          }
          label={params.row.vendor_courier_detail.status == 'Active' ? t('Active') : t('Inactive')}
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
        return (
          <>
            {checkPermission('setting - shipping.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton
                  size='small'
                  onClick={() => handleEdit(params.row.vendor_courier_detail)}
                >
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('setting - shipping.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton
                  size='small'
                  onClick={() => handleDelete(params.row.vendor_courier_detail)}
                >
                  <Icon icon='tabler:trash' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
          </>
        )
      }
    }
  ]

  return (
    <>
      <Box px={4} mt={4} display={'flex'} alignItems={'center'} columnGap={4}>
        {t('Courier')}
        <SelectCustom
          fullWidth
          value={courierId}
          onSelect={value => setCourierId(value.id)}
          options={courierDatas}
          optionKey={'id'}
          labelKey={'name'}
        />
      </Box>
      <Divider sx={{ mt: 3 }} />
      <TableHeader
        title={t('Courier Outlet')}
        // {...(checkPermission(auth.permissions, 'products.category.create') && {
        //   onAdd: () => setOpenDialog(true)
        // })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        getRowId={row => row.vendor_courier_detail.id}
        autoHeight
        rows={checkPermission('setting - shipping.read') ? datas : []}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('setting - shipping.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
        {...(checkPermission('setting - shipping.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusCourierOutlet(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusCourierOutlet(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <CourierOutletDialog
        open={openDialog}
        toggle={handleToggle}
        selectData={selectedData}
        refetch={refreshData}
      />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Courier Outlet'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Courier Outlet'
      />
    </>
  )
}

export default CourierOutletTab
