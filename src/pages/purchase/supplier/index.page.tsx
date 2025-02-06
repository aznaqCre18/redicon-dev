import React, { ChangeEvent, useEffect, useState } from 'react'
import { GridColDef } from '@mui/x-data-grid'
import {
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Switch,
  Card,
  Tooltip,
  Button
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import FormDialogSupplier from './components/FormDialogSupplier'
import { SupplierType } from 'src/types/apps/supplier'
import { supplierService } from 'src/services/supplier'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

const SupplierPage = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()
  const router = useRouter()

  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
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
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<string | null>(null)

  const [unitsData, setUnitsData] = useState<SupplierType[]>([])
  const [unitMeta, setUnitMeta] = useState<MetaType>()
  const [deleteBatch, setDeleteBatch] = useState(false)

  const { isLoading, refetch } = useQuery(['supplier-list', pageOption], {
    queryFn: () => supplierService.getList(pageOption),
    enabled: checkPermission('supplier.read'),
    onSuccess: data => {
      setUnitsData(data?.data.data ?? [])
      setUnitMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(supplierService.delete, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('supplier-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

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

  const { mutate: setBatchStatus } = useMutation(supplierService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('supplier-list')
    }
  })

  const setBatchStatusSupplier = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const [itemSelected, setItemSelected] = useState<SupplierType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    supplierService.deleteBatch,
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

  const { mutate: setStatus } = useMutation(supplierService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('supplier-list')
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const { mutate: exportExcel } = useMutation(supplierService.exportExcel, {
    onSuccess: data => {
      const url = window.URL.createObjectURL(new Blob([data.data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'supplier.xlsx')
      link.click()

      toast.success(t('Success download file'))
    }
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    data?: SupplierType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(unitsData)
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
      field: 'phone_number',
      headerName: t('Phone Number') ?? 'Phone Number'
    },
    {
      flex: 1,
      field: 'address',
      headerName: t('Address') ?? 'Address'
    },
    {
      flex: 1,
      field: 'credit_term',
      headerName: t('Credit Term') ?? 'Credit Term'
    },
    {
      field: 'status',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.status === 'ACTIVE'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('supplier.update') &&
                  setStatusData(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.status === 'ACTIVE' ? t('Active') : t('Disable')}
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
            {checkPermission('supplier.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row.id)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}

            {checkPermission('supplier.delete') && !params.row.is_default && (
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
    <Card>
      <TableHeader
        title={t('Supplier')}
        {...(checkPermission('supplier.create') && { onAdd: () => setFormAddOpen(true) })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      >
        {/* <Button
          variant='outlined'
          onClick={() => exportExcel()}
          startIcon={<Icon icon='file-icons:microsoft-excel' />}
        >
          {t('Export')}
        </Button> */}
      </TableHeader>
      <DataGridCustom
        loading={isLoading}
        autoHeight
        rows={unitsData}
        columns={columns}
        hideFooter
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={unitMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('supplier.delete') && {
          onDelete: () => setDeleteBatch(true)
        })}
        {...(checkPermission('supplier.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusSupplier(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusSupplier(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <FormDialogSupplier
        open={formAddOpen}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteUser}
        loading={loadingDelete}
        name='Supplier'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Supplier'
      />
    </Card>
  )
}

export default SupplierPage
