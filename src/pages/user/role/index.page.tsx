// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

import { Button, Card, Checkbox, FormControlLabel, IconButton, Switch } from '@mui/material'
import React from 'react'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { roleService } from 'src/services/role'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { MetaType } from 'src/types/pagination/meta'
import { UserRoleType } from 'src/types/apps/userRoleTypes'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import TableHeader from 'src/views/setting/components/TableHeader'
import { useAuth } from 'src/hooks/useAuth'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import FromUserRoleGroupDialog from '../components/FormUserRoleGroupDialog'

const Role = () => {
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

  const queryClient = useQueryClient()
  // ** States
  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')
  const [formAddOpen, setFormAddOpen] = useState(false)
  const [loadingDelete, setLoadingDelete] = React.useState(false)
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<string | null>(null)

  const [rolesData, setRolesData] = useState<UserRoleType[]>([])
  const [roleMeta, setRoleMeta] = useState<MetaType>()
  const [deleteBatch, setDeleteBatch] = useState(false)

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    roleService.deleteBatchRole,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('role-list')
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const { isLoading } = useQuery(['role-list', pageOption], {
    queryFn: () => roleService.getListRole(pageOption),
    enabled: checkPermission('role.read'),
    onSuccess: data => {
      if (data.data.data) {
        setRolesData(data.data.data)
        setRoleMeta(data.data.meta)
      }
    }
  })

  const deleteRoleMutation = useMutation(roleService.deleteRole, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('role-list')
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
      deleteRoleMutation.mutate(selectedData)
    }
  }

  const handleCloseRoleDialog = () => {
    setFormAddOpen(false)
    setSelectedData(null)
  }

  const handleCloseDeleteRole = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const [itemSelected, setItemSelected] = useState<UserRoleType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const { mutate: setBatchStatus } = useMutation(roleService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('role-list')
    }
  })

  const setBatchStatusRole = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    role?: UserRoleType
  ) => {
    if (id !== 'all') {
      if (role && event.target.checked) setItemSelected([...itemSelected, role])
      else if (role && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != role.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(rolesData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(roleService.updateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('role-list')
    }
  })

  const setStatusRole = (id: number, status: boolean) => {
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
      field: 'description',
      headerName: t('Description') ?? 'Description',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.description}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.is_active === 'Active'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setStatusRole(parseInt(params.row.id), event.target.checked)
              }}
            />
          }
          label={params.row.status ?? true ? t('Active') : t('Disable')}
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
            {checkPermission('role.update') && (
              <IconButton size='small' onClick={() => handleEdit(params.row.id)}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            )}
            {!params.row.is_default && checkPermission('role.delete') && (
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
          title={t('Role') ?? 'Role'}
          {...(checkPermission('role.create') && {
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
          rows={rolesData ?? []}
          columns={columns}
          disableColumnMenu
          hideFooter
          setPaginationData={setPageOption}
        />
        <PaginationCustom
          itemSelected={itemSelected}
          meta={roleMeta}
          onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
          {...(checkPermission('role.delete') && {
            onDeleteButton: () => setDeleteBatch(true)
          })}
          button={
            <>
              {checkPermission('role.update') && (
                <>
                  {/* set active */}
                  <Button
                    variant='contained'
                    onClick={() => setBatchStatusRole(true)}
                    color='success'
                  >
                    {t('Active')}
                  </Button>
                  {/* set disable */}
                  <Button
                    variant='contained'
                    onClick={() => setBatchStatusRole(false)}
                    color='warning'
                  >
                    {t('Disable')}
                  </Button>
                </>
              )}
            </>
          }
        />
        <FromUserRoleGroupDialog
          open={formAddOpen}
          toggle={handleCloseRoleDialog}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
        />
        <DialogConfirmation
          open={formDeleteOpen}
          handleClose={handleCloseDeleteRole}
          handleConfirm={handleConfirmDelete}
          loading={loadingDelete}
          name='Role'
        />
        <DialogConfirmation
          open={deleteBatch}
          handleClose={() => setDeleteBatch(false)}
          handleConfirm={handleConfirmDeleteBatch}
          loading={isLoadingDeleteBatch}
          name='Role'
        />
      </div>
    </Card>
  )
}

export default Role
