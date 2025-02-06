import React, { ChangeEvent, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import { ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

// ** Data Import
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { userService } from 'src/services/user'
import FormUserDialog from '../components/FormUserDialog'
import { UserDetailType } from 'src/types/apps/userTypes'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import TableHeader from 'src/views/setting/components/TableHeader'
import { useAuth } from 'src/hooks/useAuth'
import MenuOptionAction from './components/MenuOptionAction'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { formatDate } from 'src/utils/dateUtils'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { getInitials } from 'src/@core/utils/get-initials'
import { outletService } from 'src/services/outlet/outlet'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** renders client column
const renderClient = (params: { row: UserDetailType }) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states: ('success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined)[] =
    ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | undefined =
    states[stateNum]

  return (
    <CustomAvatar
      skin='light'
      color={color}
      sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      src={row.user.profile_picture ? getImageAwsUrl(row.user.profile_picture) : ''}
    >
      {getInitials(row.user.name ? row.user.name : 'John Doe')}
    </CustomAvatar>
  )
}

const User = () => {
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

  const { checkPermission } = useAuth()
  const queryClient = useQueryClient()
  // ** States
  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const [deleteUser, setDeleteUser] = useState(false)
  const [loadingDelete, setLoadingDelete] = React.useState(false)
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)

  const [userData, setUserData] = useState<UserDetailType[]>([])
  const [userMeta, setUserMeta] = useState<MetaType>()
  const [deleteBatch, setDeleteBatch] = useState(false)

  const [outletFilter, setOutletFilter] = useState<string | undefined>()
  const [outletData, setOutletData] = useState<SelectOption[]>([])

  useEffect(() => {
    setPageOption({ ...pageOption, outlet_id: outletFilter == 'all' ? undefined : outletFilter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilter])

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data
      if (datas.length > 1) {
        setOutletFilter('all')

        setOutletData([
          { value: 'all', label: t('All') },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      }
    }
  })

  const { isLoading } = useQuery(['user-list', pageOption], {
    queryFn: () => userService.getListUser(pageOption),
    enabled: checkPermission('user list.read'),
    onSuccess: data => {
      if (data.data.data) {
        setUserData(data.data.data)
        setUserMeta(data.data.meta)
      }
    }
  })

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  const deleteUserMutation = useMutation(userService.deleteUser, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('user-list')
      setDeleteUser(false)
      setSelectedUser(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  const handleEdit = (id: string | null) => {
    setAddUserOpen(true)
    setSelectedUser(id)
  }

  const handleDelete = (id: string | null) => {
    setSelectedUser(id)
    setDeleteUser(true)
  }

  const handleConfirmDeleteUser = () => {
    if (selectedUser !== null) {
      setLoadingDelete(true)
      deleteUserMutation.mutate(selectedUser)
    }
  }

  const handleCloseDeleteUser = () => {
    setDeleteUser(false)
    setSelectedUser(null)
  }

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    userService.deleteBatchUser,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('user-list')
        setDeleteBatch(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const [itemSelected, setItemSelected] = useState<UserDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => parseInt(item.user.id)) as number[])
    }
  }

  const { mutate: setBatchStatus } = useMutation(userService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('user-list')
    }
  })

  const setBatchStatusCategory = (status: boolean) => {
    const ids = itemSelected.map(item => parseInt(item.user.id)) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    user?: UserDetailType
  ) => {
    if (id !== 'all') {
      if (user && event.target.checked) setItemSelected([...itemSelected, user])
      else if (user && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.user.id != user.user.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(userData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(userService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('user-list')
    }
  })

  const setStatusUser = (id: number, status: string) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<UserDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.user.id, index.row)}
            key={index.row.user.id}
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
          (index.api.getRowIndexRelativeToVisibleRows(index.row.user.id) ?? 1) +
          1 +
          (pageOption?.limit ?? 50) * ((pageOption?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 2,
      field: 'name',
      headerName: t('User2') ?? 'User',
      renderCell: params => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                className='hover-underline'
                onClick={() => handleEdit(params.row.user.id)}
                noWrap
                variant='body2'
                sx={{
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                {params.row.user.name}
              </Typography>
              <Typography noWrap variant='caption'>
                {params.row.user.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    // {
    //   field: 'department_id',
    //   headerName: t('Department') ?? 'Department',
    //   flex: 1,
    //   renderCell: params => (
    //     <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //       {params.row.department?.name ?? ''}
    //     </Typography>
    //   )
    // },
    {
      field: 'role',
      headerName: t('Role') ?? 'Role',
      flex: 1,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.role?.name ?? ''}
        </Typography>
      )
    },
    // {
    //   field: 'outlet_ids',
    //   headerName: 'outlet',
    //   flex: 1,
    //   renderCell: params => {
    //     const outlets = params.row.outlet ?? []

    //     if (outlets.length == outletData.length - 1) {
    //       return (
    //         <Tooltip title={outlets.map(outlet => outlet.name).join(', ')} placement='top'>
    //           <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //             All Outlet
    //           </Typography>
    //         </Tooltip>
    //       )
    //     }

    //     if (outlets.length === 0) {
    //       return (
    //         <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //           -
    //         </Typography>
    //       )
    //     }

    //     return (
    //       <Tooltip title={outlets.map(outlet => outlet.name).join(', ')} placement='top'>
    //         <Typography variant='body2' sx={{ color: 'text.primary' }}>
    //           {outlets.map(outlet => outlet.name).join(', ')}
    //         </Typography>
    //       </Tooltip>
    //     )
    //   }
    // },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.user.status == 'Active'}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('user list.update') &&
                  setStatusUser(
                    parseInt(params.row.user.id),
                    event.target.checked ? 'Active' : 'Inactive'
                  )
              }}
            />
          }
          label={params.row.user.status == 'Active' ? t('Active') : t('Disable')}
        />
      )
    },
    {
      field: 'last_login',
      headerName: t('Last Login') ?? 'Last Login',
      flex: 1,
      renderCell: params => {
        const dateString = formatDate(new Date(params.row.user?.last_login))

        return (
          <Tooltip title={dateString} placement='top'>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {dateString}
            </Typography>
          </Tooltip>
        )
      }
    },
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        const { row } = params

        return (
          <Box
            sx={{
              display: 'flex'
            }}
          >
            {checkPermission('user list.update') && (
              <Tooltip title='Edit' placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row.user.id)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {userData.length > 1 && checkPermission('user list.delete') && (
              <Tooltip title='Delete' placement='top'>
                <IconButton size='small' onClick={() => handleDelete(params.row.user.id)}>
                  <Icon icon='tabler:trash' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Tooltip' placement='bottom'>
              <MenuOptionAction data={row} />
            </Tooltip>
          </Box>
        )
      }
    }
  ]

  // Horizontal Scrollbar Table in Pagination
  const setBottomScrollEl = useSetAtom(bottomScrollElAtom)
  const setBottomWrapScrollWidth = useSetAtom(bottomWrapScrollWidthAtom)

  const gridRef = useGridApiRef()
  const dataGridRef = useRef<HTMLDivElement | null>(null)
  const onResize = (containerSize: ElementSize) => {
    setBottomWrapScrollWidth(containerSize.width)
    if (dataGridRef.current) {
      const el = dataGridRef.current.getElementsByClassName('MuiDataGrid-virtualScrollerContent')
      if (el.length > 0) setBottomScrollEl(el[0])
    }
  }

  return (
    <Card>
      <div style={{ marginTop: 2 }}>
        <TableHeader
          title={t('User2') ?? 'User'}
          {...(checkPermission('user list.create') && {
            onAdd: () => setAddUserOpen(true)
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
        >
          <Link href='/user/role'>
            <Button variant='outlined'>Role</Button>
          </Link>
        </TableHeader>
        <DataGridCustom
          loading={isLoading}
          ref={dataGridRef}
          apiRef={gridRef}
          onResize={onResize}
          autoHeight
          getRowId={row => row.user.id}
          rows={userData ?? []}
          columns={columns}
          disableColumnMenu
          hideFooter
          setPaginationData={setPageOption}
        />
        <PaginationCustom
          itemSelected={itemSelected}
          meta={userMeta}
          onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
          {...(checkPermission('user list.delete') && {
            onDeleteButton: () => setDeleteBatch(true)
          })}
          button={
            <>
              {checkPermission('user list.update') && (
                <>
                  {/* set active */}
                  <Button
                    variant='contained'
                    onClick={() => setBatchStatusCategory(true)}
                    color='success'
                  >
                    {t('Active')}
                  </Button>
                  {/* set disable */}
                  <Button
                    variant='contained'
                    onClick={() => setBatchStatusCategory(false)}
                    color='warning'
                  >
                    {t('Disable')}
                  </Button>
                </>
              )}
            </>
          }
        />
        <FormUserDialog
          open={addUserOpen}
          toggle={toggleAddUserDrawer}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <DialogConfirmation
          open={deleteUser}
          handleClose={handleCloseDeleteUser}
          handleConfirm={handleConfirmDeleteUser}
          loading={loadingDelete}
          name='User2'
        />
        <DialogConfirmation
          open={deleteBatch}
          handleClose={() => setDeleteBatch(false)}
          handleConfirm={handleConfirmDeleteBatch}
          loading={isLoadingDeleteBatch}
          name='User2'
        />
      </div>
    </Card>
  )
}

export default User
