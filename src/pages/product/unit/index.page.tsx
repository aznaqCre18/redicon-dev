import React, { ChangeEvent, useEffect, useState } from 'react'
import { GridColDef } from '@mui/x-data-grid'
import {
  Typography,
  IconButton,
  Checkbox,
  Card,
  FormControlLabel,
  Switch,
  Tooltip,
  Button
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { UnitType } from 'src/types/apps/unitType'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { unitService } from 'src/services/unit'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { ResponseType } from 'src/types/response/response'
import { toast } from 'react-hot-toast'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useAuth } from 'src/hooks/useAuth'
import TableHeader from 'src/components/table/TableHeader'
import FormUnitDialog from './FormUnitDialog'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const UnitContent = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const queryClient = useQueryClient()
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
  const [selectUnit, setSelectUnit] = useState<UnitType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [deleteUnit, setDeleteUnit] = useState(false)
  const [deleteBatchUnit, setDeleteBatchUnit] = useState(false)

  // ** Query
  const [unitsData, setUnitsData] = useState<UnitType[]>([])
  const [unitMeta, setUnitMeta] = useState<MetaType>()
  const { isLoading, refetch } = useQuery(['units-list', pageOption], {
    queryFn: () => unitService.getListUnit(pageOption),
    enabled: checkPermission('unit.read'),
    onSuccess: data => {
      setUnitsData(data.data.data ?? [])
      setUnitMeta(data.data.meta)
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(unitService.deleteUnit, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      refetch()
      setDeleteUnit(false)
      setSelectedUnit(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectUnit(null)
  }

  const handleEdit = (Unit: UnitType) => {
    setSelectUnit(Unit)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedUnit(id)
    setDeleteUnit(true)
  }

  const handleCloseDeleteUnit = () => {
    setDeleteUnit(false)
    setSelectedUnit(null)
  }

  const handleConfirmDeleteUnit = () => {
    if (selectedUnit !== null) {
      mutate(selectedUnit)
    }
  }

  const { mutate: setBatchStatus } = useMutation(unitService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('units-list')
    }
  })

  const setBatchStatusUnit = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const { mutate: exportExcel } = useMutation(unitService.exportExcel, {
    onSuccess: data => {
      const url = window.URL.createObjectURL(new Blob([data.data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'units.xlsx')
      link.click()

      toast.success(t('Success download file'))
    }
  })

  const [itemSelected, setItemSelected] = useState<UnitType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    unitService.deleteBatchUnit,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))

        refetch()
        setDeleteBatchUnit(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatchUnit = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    unit?: UnitType
  ) => {
    if (id !== 'all') {
      if (unit && event.target.checked) setItemSelected([...itemSelected, unit])
      else if (unit && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != unit.id))

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

  const { mutate: setStatus } = useMutation(unitService.updateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('units-list')
    }
  })

  const setStatusUnit = (id: number, status: boolean) => {
    setStatus({ id: id, status })
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
      sortable: false,
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      width: 300,
      field: 'name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row)}
          sx={{
            color: 'primary.main',
            fontWeight: 600
          }}
        >
          {params.row?.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'quantity',
      headerName: t('Quantity') ?? 'Quantity',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.quantity}
        </Typography>
      )
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
                checkPermission('unit.update') && setStatusUnit(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.is_active ? t('Active') : t('Disable')}
        />
      )
    },
    {
      cellClassName: 'column-action',
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <>
            {checkPermission('unit.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_default && checkPermission('unit.delete') && (
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

  return (
    <Card
      sx={{
        mb: '50px'
      }}
    >
      <TableHeader
        title={t('Unit')}
        {...(checkPermission('unit.create') && {
          onAdd: () => setOpenDialog(true)
        })}
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
        rows={unitsData ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={unitMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('unit.delete') && {
          onDeleteButton: () => setDeleteBatchUnit(true)
        })}
        button={
          <>
            {checkPermission('unit.update') && (
              <>
                {/* set active */}
                <Button
                  variant='contained'
                  onClick={() => setBatchStatusUnit(true)}
                  color='success'
                >
                  {t('Active')}
                </Button>
                {/* set disable */}
                <Button
                  variant='contained'
                  onClick={() => setBatchStatusUnit(false)}
                  color='warning'
                >
                  {t('Disable')}
                </Button>
              </>
            )}
          </>
        }
      />
      <FormUnitDialog open={openDialog} toggle={handleToggle} selectUnit={selectUnit} />
      <DialogConfirmation
        open={deleteUnit}
        handleClose={handleCloseDeleteUnit}
        handleConfirm={handleConfirmDeleteUnit}
        loading={isLoadingDelete}
        name='Unit'
      />
      <DialogConfirmation
        open={deleteBatchUnit}
        handleClose={() => setDeleteBatchUnit(false)}
        handleConfirm={handleConfirmDeleteBatchUnit}
        loading={isLoadingDeleteBatch}
        name='Unit'
      />
    </Card>
  )
}

export default UnitContent
