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
import { CourierType } from 'src/types/apps/vendor/courier'
import { courierService } from 'src/services/vendor/courier'
import FormCourierDialog from '../dialog/FormCourierDialog'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const CourierManualTab = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  // TABLE
  const queryClient = useQueryClient()

  const [selectedData, setSelectedData] = useState<CourierType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteData, setDeleteData] = useState(false)

  const [dataMeta, setDataMeta] = useState<MetaType>()
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...defaultPagination,
    ...router.query
  } as any)
  const [datas, setDatas] = useState<CourierType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'courier-manual'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  // ** Query
  useQuery(['courier-list', pageOption], {
    queryFn: () => courierService.getList(pageOption),
    onSuccess: data => {
      setDatas(data.data.data ?? [])

      setDataMeta(data.data.meta)
    }
  })

  const { mutate, isLoading } = useMutation(courierService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('courier-list')
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setSelectedData(null)
    setOpenDialog(false)
  }

  const handleEdit = (data: CourierType) => {
    setSelectedData(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: CourierType) => {
    setSelectedData(data)
    setDeleteData(true)
  }

  const handleCloseDeleteCategory = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (selectedData !== null) {
      mutate(selectedData.id)
    }
  }

  const [itemSelected, setItemSelected] = useState<CourierType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    courierService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('courier-list')
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
    id: number | 'all',
    data?: CourierType
  ) => {
    if (id !== 'all') {
      if (data && event.target.checked) setItemSelected([...itemSelected, data])
      else if (data && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != data.id))

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

  const columns: GridColDef<CourierType>[] = [
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
      field: 'name',
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

  return (
    <Box>
      <TableHeader
        title={t('Courier')}
        {...(checkPermission('setting - shipping.create') && {
          onAdd: () => setOpenDialog(true)
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        getRowId={row => row.id}
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
      <FormCourierDialog open={openDialog} toggle={handleToggle} selectCourier={selectedData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Courier Manual'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Courier Manual'
      />
    </Box>
  )
}

export default CourierManualTab
