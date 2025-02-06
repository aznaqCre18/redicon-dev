import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Checkbox, Tooltip, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'
import FormOutlet from './FormOutletDialog'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { outletService } from 'src/services/outlet/outlet'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import Avatar from 'src/components/image/Avatar'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { getInitials } from 'src/@core/utils/get-initials'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { formatDate, formatDateOnly } from 'src/utils/dateUtils'

// ** renders client column
const renderClient = (params: { row: OutletType }) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states: ('success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined)[] =
    ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined =
    states[stateNum]

  return (
    <Avatar
      skin='light'
      color={color}
      sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      src={row.logo ? getImageAwsUrl(row.logo) : ''}
    >
      {getInitials(row.name ? row.name : 'John Doe')}
    </Avatar>
  )
}

const OutletComponent = () => {
  const { checkPermission, maxOutlet } = useAuth()

  const { t } = useTranslation()
  const router = useRouter()

  // ** States
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<string | null>(null)

  const [outletData, setOutletData] = useState<OutletType[]>([])
  const [outletMeta, setOutletMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query,
    order: 'created_at'
  } as any)
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'Outlet'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const { isLoading, refetch } = useQuery(['outlet-list', pageOption], {
    queryFn: () => outletService.getListOutletShowDisabled(pageOption),
    enabled: checkPermission('outlet.read'),
    onSuccess: data => {
      setOutletData(data?.data.data ?? [])
      setOutletMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(outletService.deleteOutlet, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('outlet-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  const handleAdd = () => {
    console.log('debugx maxOutlet', maxOutlet)

    if (maxOutlet > outletData.length || maxOutlet == 0) {
      setFormAddOpen(true)
      setSelectedData(null)
    } else {
      toast.error('Outlet telah mencapai batas maksimum, silahkan upgrade paket langgananmu')

      router.push('/account-settings/subscription/add')
    }
  }

  const handleEdit = (id: string | null) => {
    setFormAddOpen(true)
    setSelectedData(id)
  }

  const handleDelete = (id: string | null) => {
    setSelectedData(id)
    setFormDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteUser = () => {
    if (selectedData !== null) {
      setLoadingDelete(true)
      deleteMutation.mutate(selectedData)
    }
  }

  const [itemSelected, setItemSelected] = useState<OutletType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    outletService.deleteBatch,
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

  const { mutate: setBatchStatus } = useMutation(outletService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('outlet-list')
    }
  })

  const setBatchStatusOutlet = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    outlet?: OutletType
  ) => {
    if (id !== 'all') {
      if (outlet && event.target.checked) setItemSelected([...itemSelected, outlet])
      else if (outlet && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != outlet.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(outletData)
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
      width: 22,
      field: 'no',
      headerName: 'No',
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      sortable: false,
      field: 'logo',
      headerName: 'Logo',
      width: 40,
      renderCell: params => renderClient(params)
    },
    {
      flex: 1,
      field: 'name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row.id)}
          sx={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {params.row.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'created_at',
      headerName: t('Date') ?? 'Date',
      renderCell: params => {
        const date = new Date(params.row.created_at)

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatDate(date)}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'susubscription_name',
      headerName: t('Subscription') ?? 'Subscription',
      renderCell: params => {
        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.subscription.name}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      field: 'expired_at',
      headerName: t('Expired') ?? 'Expired',
      renderCell: params => {
        const date = new Date(params.row.subscription.expired_at)

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatDateOnly(date)}
          </Typography>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => (params.row.status === 'Active' ? t('Active') : t('Expired'))
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
            {checkPermission('outlet.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row.id)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_default && checkPermission('outlet.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row.id)}>
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
        title='Outlet'
        {...(checkPermission('outlet.create') && {
          onAdd: handleAdd
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        loading={isLoading}
        autoHeight
        rows={outletData}
        columns={columns}
        hideFooter
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={outletMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('outlet.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
        {...(checkPermission('outlet.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusOutlet(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusOutlet(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <FormOutlet
        open={formAddOpen}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteUser}
        loading={loadingDelete}
        name='Outlet'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Outlet'
      />
    </Box>
  )
}

export default OutletComponent
