import React, { ChangeEvent, useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import {
  Typography,
  IconButton,
  Pagination,
  FormControlLabel,
  Switch,
  Checkbox,
  Tooltip,
  Button
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import Link from '@mui/material/Link'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { shortcutService } from 'src/services/shortcut'
import FormShortcut from './dialog/FormShortcut'
import { ShortcutType } from 'src/types/apps/shortcutType'
import TableHeader from 'src/components/table/TableHeader'
import RenderImageAws from 'src/components/image/RenderImagesAws'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

interface CellType {
  api: { getRowIndexRelativeToVisibleRows: (arg0: any) => number }
  row: ShortcutType
}

const ShortcutIconComponent = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()
  const router = useRouter()
  // ** States
  const [openForm, setOpenForm] = useState(false)
  const queryClient = useQueryClient()
  const [data, setData] = useState<ShortcutType[]>([])
  const [meta, setMeta] = useState<MetaType>()
  const [formDeleteOpen, setFormDeleteOpen] = useState(false)
  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    limit: 50,
    page: 1,
    sort: 'desc',
    order: 'created_at',
    ...router.query
  } as any)

  useEffect(() => {
    router.replace({
      query: pageOption,
      hash: 'Shortcut'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<ShortcutType | null>(null)

  const [deleteBatchOpen, setDeleteBatchOpen] = useState(false)

  const { refetch } = useQuery(['shortcut-list', pageOption], {
    queryFn: () => shortcutService.getList(pageOption),
    enabled: checkPermission('shortcut.read'),
    onSuccess: data => {
      setData(data.data.data ?? [])
      setMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(shortcutService.delete, {
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
        queryClient.invalidateQueries('shortcut-list')
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

  const handleAdd = () => {
    setOpenForm(true)
    setSelectedData(null)
  }

  const handleEdit = (data: ShortcutType) => {
    setOpenForm(true)
    setSelectedData(data)
  }

  const handleDelete = (data: ShortcutType) => {
    setSelectedData(data)
    setFormDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedData !== null && selectedData.id) {
      setLoadingDelete(true)
      deleteMutation.mutate(selectedData.id)
    }
  }

  const { mutate: setStatus } = useMutation(shortcutService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('shortcut-list')
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const [itemSelected, setItemSelected] = useState<ShortcutType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    shortcutService.deleteBatch,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchOpen(false)
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

  const { mutate: setBatchStatus } = useMutation(shortcutService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('shortcut-list')
    }
  })

  const setBatchStatusShortcut = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    shortcut?: ShortcutType
  ) => {
    if (id !== 'all') {
      if (shortcut && event.target.checked) setItemSelected([...itemSelected, shortcut])
      else if (shortcut && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != shortcut.id))

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
      renderCell: index => {
        return (
          <Checkbox
            checked={itemSelected.includes(index.row) || false}
            onChange={e => handleChange(e, index.row.id.toString(), index.row)}
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
      field: 'no',
      headerName: 'No',
      width: 22,
      renderCell: (index: CellType) => {
        return index.api.getRowIndexRelativeToVisibleRows(index.row.id) + 1
      }
    },
    {
      minWidth: 80,
      field: 'shortcut',
      headerName: t('Image') ?? 'Image',
      renderCell: (params: { row: any }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderImageAws url={params.row.image} name={params.row.name} />
          </Box>
        )
      }
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'name',
      headerName: t('Shortcut Name') ?? 'Shortcut Name',
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
      flex: 1,
      minWidth: 180,
      field: 'url',
      headerName: 'URL',
      renderCell: params => <Link href={params.row.url}>{params.row.url}</Link>
    },

    {
      flex: 1,
      minWidth: 150,
      field: 'status',
      headerName: 'Status',
      renderCell: params => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.status}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('shortcut.update') &&
                  setStatusData(parseInt(params.row.id), event.target.checked)
              }}
            />
          }
          label={params.row.status ? t('Active') : t('Disable')}
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
            {checkPermission('shortcut.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('shortcut.delete') && (
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
    <Box
      sx={{
        mb: '50px'
      }}
    >
      <TableHeader
        title='Shortcut'
        {...(checkPermission('shortcut.create') && { onAdd: handleAdd })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        autoHeight
        rows={data}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        slots={{
          pagination: () => <Pagination count={10} color='primary' />
        }}
        pageSizeOptions={[7, 10, 25, 50]}
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={meta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('shortcut.delete') && {
          onDelete: () => setDeleteBatchOpen(true)
        })}
        {...(checkPermission('shortcut.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusShortcut(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusShortcut(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <FormShortcut selectShorcut={selectedData} open={openForm} toggle={handleCloseFormDialog} />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDelete}
        loading={loadingDelete}
        name='Shortcut'
      />
      <DialogConfirmation
        open={deleteBatchOpen}
        handleClose={() => setDeleteBatchOpen(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Shortcut'
      />
    </Box>
  )
}

export default ShortcutIconComponent
