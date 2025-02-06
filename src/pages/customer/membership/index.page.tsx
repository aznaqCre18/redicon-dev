// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

import { GridColDef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'

// ** Data Import
import DialogAdd from './dialog/FormMembership'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { MembershipType } from 'src/types/apps/membershipType'
import { MetaType } from 'src/types/pagination/meta'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { membershipService } from 'src/services/membership'
import toast from 'react-hot-toast'
import FormMembership from './dialog/FormMembership'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import {
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
  Typography
} from '@mui/material'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import TableHeader from 'src/components/table/TableHeader'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

const Membership = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    limit: 50,
    page: 1,
    sort: 'asc',
    order: 'level',
    ...(router.query as any)
  })

  useEffect(() => {
    router.replace({
      query: pageOption
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])
  // ** States
  const [formAdd, setOpenForm] = useState(false)
  const queryClient = useQueryClient()
  const [data, setData] = useState<MembershipType[]>([])
  const [meta, setMeta] = useState<MetaType>()
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<MembershipType | null>(null)

  const [deleteBatchMembership, setDeleteBatchMembership] = useState(false)

  const { isLoading, refetch } = useQuery(['membership-list', pageOption], {
    queryFn: () => membershipService.getList(pageOption),
    enabled: checkPermission('membership.read'),
    onSuccess: data => {
      setData(data.data.data ?? [])
      setMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(membershipService.deleteItem, {
    onSuccess: response => {
      toast.success(t((response as unknown as ResponseType).data.message))

      if (meta && meta.page > 1) {
        if (data && data.length === 1) {
          setMeta({
            ...meta,
            page: meta.page - 1
          })
        }
      } else {
        queryClient.invalidateQueries('membership-list')
      }

      setFormDeleteOpen(false)
      setSelectedData(null)
    },
    onSettled: () => {
      setLoadingDelete(false)
    }
  })

  const handleCloseDelete = () => {
    setFormDeleteOpen(false)
    setSelectedData(null)
  }

  const handleCloseFormDialog = () => {
    setOpenForm(false)
    setSelectedData(null)
  }

  const handleEdit = (data: MembershipType) => {
    setOpenForm(true)
    setSelectedData(data)
  }

  // const handleDelete = (data: MembershipType) => {
  //   setSelectedData(data)
  //   setFormDeleteOpen(true)
  // }

  const handleConfirmDelete = () => {
    if (selectedData !== null) {
      setLoadingDelete(true)
      deleteMutation.mutate(selectedData.id)
    }
  }

  const { mutate: setStatus } = useMutation(membershipService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('membership-list')
    }
  })

  const setStatusMembership = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const { mutate: setBatchStatus } = useMutation(membershipService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('membership-list')
    }
  })

  const setBatchStatusMembership = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const [itemSelected, setItemSelected] = useState<MembershipType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    membershipService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchMembership(false)
        setItemSelected([])
        setCheckedAll(false)
      }
    }
  )

  const handleConfirmDeleteBatchMembership = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    membership?: MembershipType
  ) => {
    if (id !== 'all') {
      if (membership && event.target.checked) setItemSelected([...itemSelected, membership])
      else if (membership && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != membership.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(data)
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
      field: 'membership',
      headerName: t('Membership') ?? 'Membership',
      renderCell: params => (
        <Typography
          variant='body2'
          className='hover-underline'
          onClick={() => handleEdit(params.row)}
          sx={{
            color: 'primary.main',
            fontWeight: 600
          }}
        >
          {params.row.name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'level',
      headerName: t('Level') ?? 'Level',
      renderCell: params => <span>{params.row.level}</span>
    },
    {
      field: 'is_active',
      headerName: t('Status') ?? 'Status',
      flex: 1,
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.is_active}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (checkPermission('membership.update'))
                  setStatusMembership(parseInt(params.row.id), event.target.checked)
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
            {checkPermission('membership.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}

            {/* {!params.row.is_default && (
              <IconButton size='small' onClick={() => handleDelete(params.row)}>
                <Icon icon='tabler:trash' fontSize='0.875rem' />
              </IconButton>
            )} */}
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
        title={t('Membership')}
        // onAdd={() => setOpenForm(true)}
        valueSearch={search}
        onSearch={value => {
          setSearch(value ?? '')
          setPageOption({ ...pageOption, query: value ?? '' })
        }}
      />
      <DataGridCustom
        loading={isLoading}
        autoHeight
        rows={data}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={meta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        onDeleteButton={() => setDeleteBatchMembership(true)}
        button={
          <>
            {/* set active */}
            <Button
              variant='contained'
              onClick={() => setBatchStatusMembership(true)}
              color='success'
            >
              {t('Active')}
            </Button>
            {/* set disable */}
            <Button
              variant='contained'
              onClick={() => setBatchStatusMembership(false)}
              color='warning'
            >
              {t('Disable')}
            </Button>
          </>
        }
      />
      <DialogAdd
        open={formAdd}
        toggle={() => setOpenForm(false)}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDelete}
        name='Membership'
        loading={loadingDelete}
      />
      <DialogConfirmation
        open={deleteBatchMembership}
        handleClose={() => setDeleteBatchMembership(false)}
        handleConfirm={handleConfirmDeleteBatchMembership}
        name='Membership'
        loading={isLoadingDeleteBatch}
      />
      <FormMembership
        open={formAdd}
        toggle={handleCloseFormDialog}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
      />
    </Card>
  )
}

export default Membership
