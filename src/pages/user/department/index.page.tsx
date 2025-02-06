// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

import { Card, Checkbox, IconButton } from '@mui/material'
import React from 'react'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { departmentService } from 'src/services/department'
import UserDepartmentDialog from '../components/FormUserDepartmentDialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { UserDepartmentType } from 'src/types/apps/userDepartmentsType'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import { useAuth } from 'src/hooks/useAuth'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const Department = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()
  const router = useRouter()

  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
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

  const queryClient = useQueryClient()

  // ** States
  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = React.useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<string | null>(null)

  const [departmentsData, setDepartmentsData] = useState<UserDepartmentType[]>([])
  const [departmentMeta, setDepartmentMeta] = useState<MetaType>()
  const [deleteBatch, setDeleteBatch] = useState(false)

  const { isLoading } = useQuery(['department-list', pageOption], {
    queryFn: () => departmentService.getListDepartment(pageOption),
    enabled: checkPermission('department.read'),
    onSuccess: data => {
      setDepartmentsData(data.data.data ?? [])
      setDepartmentMeta(data.data.meta)
    }
  })

  const deleteDepartmentMutation = useMutation(departmentService.deleteDepartment, {
    onSuccess: data => {
      toast.success((data as unknown as ResponseType).data.message)

      queryClient.invalidateQueries('department-list')
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
    setFormDeleteOpen(true)
    setSelectedData(id)
  }

  const handleConfirmDelete = () => {
    if (selectedData !== null) {
      setLoadingDelete(true)
      deleteDepartmentMutation.mutate(selectedData)
    }
  }

  const handleCloseDepartmentDialog = () => {
    setFormAddOpen(false)
    setSelectedData(null)
  }

  const handleCloseDeleteDepartment = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const [itemSelected, setItemSelected] = useState<UserDepartmentType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    departmentService.deleteBatch,
    {
      onSuccess: data => {
        toast.success((data as unknown as ResponseType).data.message)
        queryClient.invalidateQueries('department-list')
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
    id: string,
    department?: UserDepartmentType
  ) => {
    if (id !== 'all') {
      if (department && event.target.checked) setItemSelected([...itemSelected, department])
      else if (department && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != department.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(departmentsData)
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
      flex: 0.15,
      minWidth: 110,
      field: 'name',
      headerName: t('Name') ?? 'Name',
      renderCell: params => (
        <Typography
          className='hover-underline'
          variant='body2'
          onClick={() => handleEdit(params.row.id)}
          sx={theme => ({
            fontWeight: 600,
            color: 'text.primary',
            ':hover': {
              color: theme.palette.primary.main
            }
          })}
        >
          {params.row.name}
        </Typography>
      )
    },
    {
      flex: 0.1,
      field: 'description',
      minWidth: 80,
      headerName: t('Description') ?? 'Description',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.description}
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
            {checkPermission('department.update') && (
              <IconButton size='small' onClick={() => handleEdit(params.row.id)}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            )}
            {!params.row.is_default && checkPermission('department.delete') && (
              <IconButton size='small' onClick={() => handleDelete(params.row.id)}>
                <Icon icon='tabler:trash' fontSize='0.875rem' />
              </IconButton>
            )}
          </>
        )
      }
    }
  ]

  return (
    <Card>
      <div style={{ marginTop: 2 }}>
        <TableHeader
          title={t('Department')}
          {...(checkPermission('department.create') && {
            onAdd: () => setFormAddOpen(true)
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
          rows={departmentsData ?? []}
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
            onDeleteButton: () => setDeleteBatch(true)
          })}
        />
        <UserDepartmentDialog
          open={formAddOpen}
          toggle={handleCloseDepartmentDialog}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
        />
        <DialogConfirmation
          open={formDeleteOpen}
          handleClose={handleCloseDeleteDepartment}
          handleConfirm={handleConfirmDelete}
          loading={loadingDelete}
          name='Department'
        />
        <DialogConfirmation
          open={deleteBatch}
          handleClose={() => setDeleteBatch(false)}
          handleConfirm={handleConfirmDeleteBatch}
          loading={isLoadingDeleteBatch}
          name='Department'
        />
      </div>
    </Card>
  )
}

export default Department
