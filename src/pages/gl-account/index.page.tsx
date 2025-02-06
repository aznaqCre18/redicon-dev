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
import FormBrandDialog from './FormBrandDialog'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { glAccountService } from 'src/services/glAccount'
import { IGlAccount } from 'src/types/apps/glAccountType'

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
  const [selectGLAccount, setSelectGLAccount] = useState<IGlAccount | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedGLAccount, setSelectedGLAccount] = useState<string | null>(null)
  const [deleteGLAccount, setDeleteGLAccount] = useState(false)
  const [deleteBatchGLAccount, setDeleteBatchGLAccount] = useState(false)

  // ** Query
  const [gLAccountsData, setGLAccountsData] = useState<IGlAccount[]>([])
  const [gLAccountMeta, setGLAccountMeta] = useState<MetaType>()
  const { isLoading, refetch } = useQuery(['gl-accounts-list', pageOption], {
    queryFn: () => glAccountService.getListGLAccount(pageOption),
    onSuccess: data => {
      setGLAccountsData(data.data.data ?? [])
      setGLAccountMeta(data.data.meta)
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(glAccountService.deleteGLAccount, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteGLAccount(false)
      setSelectedGLAccount(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectGLAccount(null)
  }

  const handleEdit = (gLAccount: IGlAccount) => {
    setSelectGLAccount(gLAccount)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedGLAccount(id)
    setDeleteGLAccount(true)
  }

  const handleCloseDeleteBrand = () => {
    setDeleteGLAccount(false)
    setSelectedGLAccount(null)
  }

  const handleConfirmDeleteBrand = () => {
    if (selectedGLAccount !== null) {
      mutate(selectedGLAccount)
    }
  }

  const { mutate: setBatchStatus } = useMutation(glAccountService.deleteBatchGLAccount, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('gl-accounts-list')
    }
  })

  const setBatchStatusBrand = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus(ids)
  }

  const [itemSelected, setItemSelected] = useState<IGlAccount[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    glAccountService.deleteBatchGLAccount,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchGLAccount(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatchBrand = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    gLAccount?: IGlAccount
  ) => {
    if (id !== 'all') {
      if (gLAccount && event.target.checked) setItemSelected([...itemSelected, gLAccount])
      else if (gLAccount && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != gLAccount.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(gLAccountsData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(glAccountService.updateStatusGLAccount, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('gl-accounts-list')
    }
  })

  const setStatusBrand = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<IGlAccount>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: (index: { row: IGlAccount }) => {
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
      headerName: t('GL Account') ?? 'GL Account',
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
                if (params.row.id && checkPermission('gLAccount.update'))
                  setStatusBrand(params.row.id, event.target.checked)
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
            {checkPermission('gLAccount.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_active && checkPermission('gLAccount.delete') && (
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
        title={t('GL Account')}
        {...(checkPermission('gLAccount.create') && {
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
        rows={gLAccountsData ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={gLAccountMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('gLAccount.delete') && {
          onDeleteButton: () => setDeleteBatchGLAccount(true)
        })}
        button={
          <>
            {checkPermission('gLAccount.update') && (
              <>
                {/* set active */}
                <Button
                  variant='contained'
                  onClick={() => setBatchStatusBrand(true)}
                  color='success'
                >
                  {t('Active')}
                </Button>
                {/* set disable */}
                <Button
                  variant='contained'
                  onClick={() => setBatchStatusBrand(false)}
                  color='warning'
                >
                  {t('Disable')}
                </Button>
              </>
            )}
          </>
        }
      />
      <FormBrandDialog open={openDialog} toggle={handleToggle} selectGLAccount={selectGLAccount} />
      <DialogConfirmation
        open={deleteGLAccount}
        handleClose={handleCloseDeleteBrand}
        handleConfirm={handleConfirmDeleteBrand}
        loading={isLoadingDelete}
        name='Brand'
      />
      <DialogConfirmation
        open={deleteBatchGLAccount}
        handleClose={() => setDeleteBatchGLAccount(false)}
        handleConfirm={handleConfirmDeleteBatchBrand}
        loading={isLoadingDeleteBatch}
        name='Brand'
      />
    </Card>
  )
}

export default DepartmentPage
