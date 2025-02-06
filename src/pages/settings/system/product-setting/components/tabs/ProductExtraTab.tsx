import React, { ChangeEvent, useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Checkbox, Tooltip, FormControlLabel, Switch } from '@mui/material'
import Icon from 'src/@core/components/icon'
import FormProductExtraDialog from './FormProductExtraDialog'
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
import { outletService } from 'src/services/outlet/outlet'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import { ProductExtraType } from 'src/types/apps/productExtra'
import { productExtraService } from 'src/services/product/extra'

const ProductExtraTab = () => {
  const { checkPermission, maxDevice } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  // ** States
  const queryClient = useQueryClient()
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<ProductExtraType | null>(null)

  const [datas, setDatas] = useState<ProductExtraType[]>([])
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
      hash: 'Product Extra'
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

  const { isLoading, refetch } = useQuery(['product-extra-list', pageOption], {
    queryFn: () => productExtraService.getList(pageOption),
    enabled: checkPermission('*'),
    onSuccess: data => {
      setDatas(data?.data.data ?? [])
      setDataMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(productExtraService.delete, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('product-extra-list')

      setFormDeleteOpen(false)
      setSelectedData(null)
    }
  })

  const handleAdd = () => {
    if (maxDevice > datas.length || maxDevice == 0) {
      setFormAddOpen(true)
      setSelectedData(null)
    } else {
      toast.error('Perangkat telah mencapai batas maksimum, silahkan upgrade paket langgananmu')

      router.push('/account-settings/subscription/add')
    }
  }

  const { mutate: setStatusMutation } = useMutation(productExtraService.updateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('product-extra-list')
    }
  })

  const setStatus = (id: number, status: boolean) => {
    setStatusMutation({ id: id, status })
  }

  const handleEdit = (device: ProductExtraType) => {
    setFormAddOpen(true)
    setSelectedData(device)
  }

  const handleDelete = (device: ProductExtraType) => {
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

  const [itemSelected, setItemSelected] = useState<ProductExtraType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    productExtraService.deleteBatch,
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
    data?: ProductExtraType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(datas.map(item => item))
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const columns: GridColDef<ProductExtraType>[] = [
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
      flex: 1,
      field: 'device_name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row)}
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
      field: 'Type',
      headerName: 'Type',
      renderCell: params => params.row.type
    },
    {
      flex: 1,
      field: 'choice_type',
      headerName: 'Choice Type',
      renderCell: params => params.row.choice_type
    },
    {
      flex: 1,
      field: 'minimum_choice',
      headerName: 'Minimum Choice',
      renderCell: params => params.row.minimum_choice
    },
    {
      flex: 1,
      field: 'maximum_choice',
      headerName: 'Maximum Type',
      renderCell: params => params.row.maximum_choice
    },
    {
      field: 'is_active',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.is_active != null && params.row.is_active}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('*') && setStatus(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.is_active ? t('Active') : t('Disable')}
        />
      )
    },
    {
      flex: 1,
      field: 'items',
      headerName: 'Item',
      renderCell: params => params.row.items.map(item => item.name).join(', ')
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
            {checkPermission('*') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('*') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row)}>
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
        title={t('Product Extra') ?? 'Product Extra'}
        {...(checkPermission('*') && {
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
        getRowId={param => param.id}
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
        {...(checkPermission('*') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
      />
      <FormProductExtraDialog
        open={formAddOpen}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDeleteUser}
        loading={deleteMutation.isLoading}
        name='Product Extra'
        action='Delete'
      />

      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        name='Product Extra'
        loading={isLoadingDeleteBatch}
      />
    </Box>
  )
}

export default ProductExtraTab
