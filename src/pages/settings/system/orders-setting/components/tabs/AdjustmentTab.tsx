import { Icon } from '@iconify/react'
import { Box, Checkbox, IconButton, Tooltip, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAuth } from 'src/hooks/useAuth'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import FormAdjustmentDialog from '../dialog/FormAdjustmentDialog'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { AdjustmentDetailType } from 'src/types/apps/vendor/adjustment'
import { adjustmentService } from 'src/services/vendor/adjustment'
import { formatPriceIDR } from 'src/utils/numberUtils'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import { OutletType } from 'src/types/apps/outlet/outlet'

const AdjustmentTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  // TABLE
  const queryClient = useQueryClient()

  const [selectedData, setSelectedData] = useState<AdjustmentDetailType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query
  } as any)

  const [datas, setDatas] = useState<AdjustmentDetailType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // Filter Outlet
  const [outlets, setOutlets] = useState<OutletType[]>([])
  const [filterOutletVal, setFilterOutletVal] = useState<string>('')
  const outletSelectedArr = filterOutletVal
    ? filterOutletVal.split(',').map(item => parseInt(item))
    : []

  // ** Query
  useQuery(['adjustment-list', pageOption], {
    queryFn: () => adjustmentService.getListDetail(pageOption),
    onSuccess: data => {
      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    }
  })

  const { mutate, isLoading } = useMutation(adjustmentService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('adjustment-list')
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleAdd = () => {
    if (datas.length >= 5) {
      toast.error(t('You can only add a maximum of 5 adjustments'))

      return
    }
    setOpenDialog(true)
  }

  const handleEdit = (data: AdjustmentDetailType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: AdjustmentDetailType) => {
    setSelectedData(data)
    setDeleteData(true)
  }

  const handleCloseDeleteCategory = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (selectedData !== null) {
      mutate(selectedData.adjustment.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<AdjustmentDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    adjustmentService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('adjustment-list')
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.adjustment.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | 'all',
    data?: AdjustmentDetailType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.adjustment.id != data.adjustment.id))

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

  const columns: GridColDef<AdjustmentDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.adjustment.id, index.row)}
            key={index.row.adjustment.id}
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
          (index.api.getRowIndexRelativeToVisibleRows(index.row.adjustment.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'name',
      headerName: t('Adjustment Name') ?? 'Adjustment Name',
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
          {params.row.adjustment.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'outlets',
      headerName: t('Outlet') ?? 'Outlet',
      renderCell: params => (
        <Typography variant='body2'>
          {params.row.outlets.length >= outlets.length
            ? t('All') + ' Outlet'
            : params.row.outlets.map(outlet => outlet.name).join(', ')}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'value',
      headerName: t('Adjustment Amount') ?? 'Adjustment Amount',
      renderCell: params => (
        <Typography variant='body2'>
          {params.row.adjustment.type === 'percentage'
            ? params.row.adjustment.value + '%'
            : formatPriceIDR(params.row.adjustment.value)}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'is_included_in_invoice',
      headerName: t('Include to Total Transaction') ?? 'Include to Total Transaction',
      renderCell: params => (
        <Typography
          variant='body2'
          color={params.row.adjustment.is_included_in_invoice ? '#0da10d' : 'error'}
          fontWeight={'bold'}
        >
          {params.row.adjustment.is_included_in_invoice ? t('Yes') : t('No')}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'is_manual_entry_allowed',
      headerName: t('Able to Change') ?? 'Able to Change',
      renderCell: params => (
        <Typography
          variant='body2'
          color={params.row.adjustment.is_manual_entry_allowed ? 'green' : 'error'}
          fontWeight={'bold'}
        >
          {params.row.adjustment.is_manual_entry_allowed ? t('Yes') : t('No')}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'is_invoice_value_reduced',
      headerName: t('Deduct from Total Amount') ?? 'Deduct from Total Amount',
      renderCell: params => (
        <Typography
          variant='body2'
          color={params.row.adjustment.is_invoice_value_reduced ? '#0da10d' : 'error'}
          fontWeight={'bold'}
        >
          {params.row.adjustment.is_invoice_value_reduced ? t('Yes') : t('No')}
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
            {checkPermission('setting - shipping.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('setting - shipping.delete') && (
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

  useEffect(() => {
    setPageOption(old => ({ ...old, outlet_ids: filterOutletVal }))
  }, [filterOutletVal])

  return (
    <Box>
      <TableHeader
        title={t('Adjustment')}
        {...(checkPermission('setting - shipping.create') && {
          onAdd: handleAdd
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
        filterComponent={[
          <FilterOutlet
            key={0}
            value={outletSelectedArr}
            setOutlets={setOutlets}
            onChange={value => {
              setFilterOutletVal(value?.join(',') ?? '')
            }}
          />
        ]}
      />
      <DataGridCustom
        getRowId={row => row.adjustment.id}
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
      />
      <FormAdjustmentDialog open={openDialog} toggle={handleToggle} selectData={selectedData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Adjustment'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Adjustment'
      />
    </Box>
  )
}

export default AdjustmentTab
