import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Checkbox, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import FormDeviceDialog from './FormDeviceDialog'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { deviceService } from 'src/services/vendor/settings/point-of-sales/device'
import { DeviceDetailType, DeviceType } from 'src/types/apps/vendor/settings/point-of-sales/device'
import { outletService } from 'src/services/outlet/outlet'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { formatDate } from 'src/utils/dateUtils'

const OutletComponent = () => {
  const { checkPermission, maxDevice } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  // ** States
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [dialogLogoutOpen, setDialogLogoutOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<DeviceType | null>(null)

  const [datas, setDatas] = useState<DeviceDetailType[]>([])
  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query,
    order: 'created_at',
    sort: 'desc'
  } as any)
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'Device'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const [outletFilter, setOutletFilter] = useState<string | undefined>(
    (pageOption.outlet_id as string) ?? 'all'
  )
  const [outletData, setOutletData] = useState<SelectOption[]>([])

  useEffect(() => {
    setPageOption(old =>
      old.outlet_id == outletFilter
        ? old
        : { ...pageOption, outlet_id: outletFilter == 'all' ? undefined : outletFilter }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilter])

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data
      if (datas.length > 1) {
        setOutletFilter((pageOption.outlet_id as string) ?? 'all')

        setOutletData([
          { value: 'all', label: t('All') ?? 'All' },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      }
    }
  })

  const { isLoading, refetch } = useQuery(['device-list', pageOption], {
    queryFn: () => deviceService.getListDetail(pageOption),
    enabled: checkPermission('device.read'),
    onSuccess: data => {
      setDatas(data?.data.data ?? [])
      setDataMeta(data.data.meta)
    }
  })

  const logoutMutation = useMutation(deviceService.logout, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('device-list')

      setDialogLogoutOpen(false)
      setSelectedData(null)
    }
  })

  const deleteMutation = useMutation(deviceService.delete, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('device-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    }
  })

  const handleLogout = (device: DeviceType) => {
    setDialogLogoutOpen(true)
    setSelectedData(device)
  }

  const handleCloseLogout = () => {
    setDialogLogoutOpen(false)
    setSelectedData(null)
  }

  const handleConfirmLogout = () => {
    if (selectedData !== null) {
      logoutMutation.mutate(selectedData.id)
    }
  }

  const handleAdd = () => {
    if (maxDevice > datas.length || maxDevice == 0) {
      setFormAddOpen(true)
      setSelectedData(null)
    } else {
      toast.error('Perangkat telah mencapai batas maksimum, silahkan upgrade paket langgananmu')

      router.push('/account-settings/subscription/add')
    }
  }

  const handleEdit = (device: DeviceType) => {
    setFormAddOpen(true)
    setSelectedData(device)
  }

  const handleDelete = (device: DeviceType) => {
    setSelectedData(device)
    setFormDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteUser = () => {
    if (selectedData !== null) {
      deleteMutation.mutate(selectedData.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<DeviceType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    deviceService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string | number,
    data?: DeviceType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas.map(item => item.device_access))
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<DeviceDetailType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: index => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row.device_access) || false}
            onChange={e => handleChange(e, index.row.device_access.id, index.row.device_access)}
            key={index.row.device_access.id}
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
      headerName: 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.device_access.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'code',
      headerName: t('Code') ?? 'Code',
      renderCell: params => params.row.device_access.code
    },
    {
      flex: 1,
      field: 'device_name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row.device_access)}
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {params.row.device_access.device_name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'device_information',
      headerName: 'Device Information',
      renderCell: params => params.row.device_access.device_information
    },
    {
      flex: 1,
      field: 'outlet_id',
      headerName: 'Outlet',
      renderCell: params => params.row.outlet.name
    },
    {
      flex: 1,
      field: 'last_sync',
      headerName: t('Last Sync') ?? 'Last Sync',
      renderCell: params => {
        const date = new Date(params.row.device_access.last_sync)

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatDate(date)}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'updated_at',
      headerName: t('Last Online') ?? 'Last Online',
      renderCell: params => {
        const date = new Date(params.row.device_access.last_login)

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatDate(date)}
          </Typography>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params =>
        params.row.device_access.status ? (
          <Typography color={'success'} fontWeight={'medium'}>
            {t('Active')}
          </Typography>
        ) : (
          <Typography color={'error'} fontWeight={'medium'}>
            {t('Inactive')}
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
          <>
            <Tooltip title={t('Logout')} placement='top'>
              <IconButton size='small' onClick={() => handleLogout(params.row.device_access)}>
                <Icon icon='uil:signout' fontSize='0.875rem' />
              </IconButton>
            </Tooltip>
            {checkPermission('device.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row.device_access)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('device.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row.device_access)}>
                  <Icon icon='tabler:trash' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
          </>
        )
      }
    }
  ]

  const handleCloseFormDialog = () => {
    setFormAddOpen(false)
    setSelectedData(null)
  }

  return (
    <Box>
      <TableHeader
        title={t('Device') ?? 'Device'}
        {...(checkPermission('device.create') && {
          onAdd: handleAdd
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={
          !getOutlet.isLoading && outletData.length > 1
            ? [
                <Select
                  fullWidth
                  sx={{ minWidth: 160 }}
                  options={outletData}
                  value={outletFilter}
                  onChange={e => {
                    setOutletFilter((e?.target?.value as string) ?? 'all')
                  }}
                  label='Outlet'
                  key={1}
                />
              ]
            : undefined
        }
      />
      <DataGridCustom
        getRowId={param => param.device_access.id}
        loading={isLoading}
        autoHeight
        rows={datas}
        columns={columns}
        hideFooter
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('device.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
      />
      <FormDeviceDialog
        open={formAddOpen}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <DialogConfirmation
        open={dialogLogoutOpen}
        handleClose={handleCloseLogout}
        handleConfirm={handleConfirmLogout}
        loading={logoutMutation.isLoading}
        name='Device'
        action='Logout'
      />

      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteUser}
        loading={deleteMutation.isLoading}
        name='Device'
        action='Delete'
      />

      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        name='Device'
        loading={isLoadingDeleteBatch}
      />
    </Box>
  )
}

export default OutletComponent
