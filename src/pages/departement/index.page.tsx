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
// import { brandService } from 'src/services/brand'
import { departmentService } from 'src/services/department'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { useAuth } from 'src/hooks/useAuth'
import FormDepartmentDialog from './FormDepartmentDialog'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
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
  const [selectDepartment, setSelectDepartment] = useState<IDepartment | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [deleteDepartment, setDeleteDepartment] = useState(false)
  const [deleteBatchDepartment, setDeleteBatchDepartment] = useState(false)

  // ** Query
  const [departmentData, setDepartmentData] = useState<IDepartment[]>([])
  const [departmentMeta, setDepartmentMeta] = useState<MetaType>()
  const { isLoading, refetch } = useQuery(['department-list', pageOption], {
    queryFn: () => departmentService.getListDepartment(pageOption),
    onSuccess: data => {
      setDepartmentData(data.data.data ?? [])
      setDepartmentMeta(data.data.meta)
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(departmentService.deleteDepartment, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteDepartment(false)
      setSelectedDepartment(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectDepartment(null)
  }

  const handleEdit = (department: IDepartment) => {
    setSelectDepartment(department)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedDepartment(id)
    setDeleteDepartment(true)
  }

  const handleCloseDeleteDepartment = () => {
    setDeleteDepartment(false)
    setSelectedDepartment(null)
  }

  const handleConfirmDeleteDepartment = () => {
    if (selectedDepartment !== null) {
      mutate(selectedDepartment)
    }
  }

  // const { mutate: setBatchStatus } = useMutation(brandService.batchUpdateStatus, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('department-list')
  //   }
  // })

  // const setBatchStatusBrand = (status: boolean) => {
  //   const ids = itemSelected.map(item => item.id) as number[]

  //   setBatchStatus({ ids, status })
  // }

  const [itemSelected, setItemSelected] = useState<IDepartment[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    departmentService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchDepartment(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatchDepartment = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    department?: IDepartment
  ) => {
    if (id !== 'all') {
      if (department && event.target.checked) setItemSelected([...itemSelected, department])
      else if (department && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != department.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(departmentData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(departmentService.updateStatusDepartment, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('department-list')
    }
  })

  const setStatusDepartment = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<IDepartment>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: (index: { row: IDepartment }) => {
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
      width: 250,
      field: 'name',
      headerName: t('Department Name') ?? 'Department Name',
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
      field: 'is_active',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.is_active != null && params.row.is_active}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (params.row.id && checkPermission('department.update'))
                  setStatusDepartment(params.row.id, event.target.checked)
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
            {checkPermission('department.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_active && checkPermission('department.delete') && (
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
        title={t('Departement')}
        {...(checkPermission('department.create') && {
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
        rows={departmentData ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={departmentMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('department.delete') && {
          onDeleteButton: () => setDeleteBatchDepartment(true)
        })}
        button={
          <>
            {checkPermission('department.update') && (
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
      <FormDepartmentDialog
        open={openDialog}
        toggle={handleToggle}
        selectDepartment={selectDepartment}
      />
      <DialogConfirmation
        open={deleteDepartment}
        handleClose={handleCloseDeleteDepartment}
        handleConfirm={handleConfirmDeleteDepartment}
        loading={isLoadingDelete}
        name='Department'
      />
      <DialogConfirmation
        open={deleteBatchDepartment}
        handleClose={() => setDeleteBatchDepartment(false)}
        handleConfirm={handleConfirmDeleteBatchDepartment}
        loading={isLoadingDeleteBatch}
        name='Department'
      />
    </Card>
  )
}

export default DepartmentPage
