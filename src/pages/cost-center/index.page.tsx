import { ChangeEvent, useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import {
  IconButton,
  Checkbox,
  Card,
  FormControlLabel,
  Switch,
  Tooltip,
  Button,
  Typography
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { useAuth } from 'src/hooks/useAuth'
import FormCostCenterDialog from './FormCostCenterDialog'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { costCenterService } from 'src/services/cost-center'
import { ICostCenter } from 'src/types/apps/costCenterType'
import { departmentService } from 'src/services/department'
import { IDepartment } from 'src/types/apps/departmentType'

const DepartmentPage = () => {
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
  const [selectCostCenter, setSelectCostCenter] = useState<ICostCenter | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null)
  const [deleteCostCenter, setDeleteCostCenter] = useState(false)
  const [deleteBatchCostCenter, setDeleteBatchCostCenter] = useState(false)

  // ** Query
  const [costCentersData, setCostCentersData] = useState<ICostCenter[]>([])
  const [costCenterMeta, setCostCenterMeta] = useState<MetaType>()
  const [departmentData, setDepartmentData] = useState<IDepartment[]>([])
  const { isLoading, refetch } = useQuery(['cost-center-list', pageOption], {
    queryFn: () => costCenterService.getListCostCenter(pageOption),
    onSuccess: data => {
      setCostCentersData(data.data.data ?? [])
      setCostCenterMeta(data.data.meta)
    }
  })
  useQuery(['department-list', pageOption], {
    queryFn: () => departmentService.getListDepartment(pageOption),
    onSuccess: data => {
      setDepartmentData(data.data.data ?? [])
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(costCenterService.deleteCostCenter, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteCostCenter(false)
      setSelectedCostCenter(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectCostCenter(null)
  }

  const handleEdit = (costCenter: ICostCenter) => {
    setSelectCostCenter(costCenter)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedCostCenter(id)
    setDeleteCostCenter(true)
  }

  const handleCloseDeleteCostCenter = () => {
    setDeleteCostCenter(false)
    setSelectedCostCenter(null)
  }

  const handleConfirmDeleteCostCenter = () => {
    if (selectedCostCenter !== null) {
      mutate(selectedCostCenter)
    }
  }

  // const { mutate: setBatchStatus } = useMutation(brandService.batchUpdateStatus, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('cost-center-list')
  //   }
  // })

  // const setBatchStatusBrand = (status: boolean) => {
  //   const ids = itemSelected.map(item => item.id) as number[]

  //   setBatchStatus({ ids, status })
  // }

  const [itemSelected, setItemSelected] = useState<ICostCenter[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    costCenterService.deleteBatchCostCenter,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchCostCenter(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatchCostCenter = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    costCenter?: ICostCenter
  ) => {
    if (id !== 'all') {
      if (costCenter && event.target.checked) setItemSelected([...itemSelected, costCenter])
      else if (costCenter && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != costCenter.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(costCentersData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(costCenterService.updateStatusCostCenter, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('cost-center-list')
    }
  })

  const setStatusCostCenter = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<ICostCenter>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: (index: { row: ICostCenter }) => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id!.toString(), index.row)}
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
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id!) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      width: 180,
      field: 'name',
      headerName: t('Cost Center') ?? 'Cost Center',
      sortable: false,
      renderCell: params => {
        // const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>
        )
      }
    },
    {
      width: 180,
      field: 'department_id',
      headerName: t('Departement') ?? 'Departement',
      sortable: false,
      renderCell: params => {
        const department = departmentData.find(item => item.id == params.row.department_id)
        // const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{department?.name || '-'}</Typography>
          </Box>
        )
      }
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
                if (params.row.id && checkPermission('cost-center.update'))
                  setStatusCostCenter(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.is_active ? t('Active') : t('Disable')}
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
            {checkPermission('cost-center.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_active && checkPermission('cost-center.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row.id!.toString())}>
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
        title={t('Cost Center')}
        {...(checkPermission('cost-center.create') && {
          onAdd: () => setOpenDialog(true)
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
        rows={costCentersData ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={costCenterMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('cost-center.delete') && {
          onDeleteButton: () => setDeleteBatchCostCenter(true)
        })}
        button={
          <>
            {checkPermission('cost-center.update') && (
              <>
                {/* set active */}
                <Button variant='contained' onClick={() => console.log(true)} color='success'>
                  {t('Active')}
                </Button>
                {/* set disable */}
                <Button variant='contained' onClick={() => console.log(false)} color='warning'>
                  {t('Disable')}
                </Button>
              </>
            )}
          </>
        }
      />
      <FormCostCenterDialog
        departmentData={departmentData}
        open={openDialog}
        toggle={handleToggle}
        selectCostCenter={selectCostCenter}
      />
      <DialogConfirmation
        open={deleteCostCenter}
        handleClose={handleCloseDeleteCostCenter}
        handleConfirm={handleConfirmDeleteCostCenter}
        loading={isLoadingDelete}
        name='Cost Center'
      />
      <DialogConfirmation
        open={deleteBatchCostCenter}
        handleClose={() => setDeleteBatchCostCenter(false)}
        handleConfirm={handleConfirmDeleteBatchCostCenter}
        loading={isLoadingDeleteBatch}
        name='Cost Center'
      />
    </Card>
  )
}

export default DepartmentPage
