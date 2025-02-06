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
import FormBanner from './dialog/FormBanner'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType } from 'src/types/pagination/pagination'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { bannerService } from 'src/services/banner'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { BannerDetailType } from 'src/types/apps/bannerType'
import RenderImageAws from 'src/components/image/RenderImagesAws'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

interface CellType {
  api: { getRowIndexRelativeToVisibleRows: (arg0: any) => number }
  row: BannerDetailType
}

const BannerComponent = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  // ** States
  const [openForm, setOpenForm] = useState(false)
  const queryClient = useQueryClient()
  const [data, setData] = useState<BannerDetailType[]>([])
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
      hash: 'Banner'
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageOption])

  const [search, setSearch] = useState<string>((pageOption.query as any) ?? '')

  const [loadingDelete, setLoadingDelete] = useState(false)
  const [selectedData, setSelectedData] = useState<BannerDetailType | null>(null)

  const [deleteBatchOpen, setDeleteBatchOpen] = useState(false)

  const { refetch } = useQuery(['banner-list', pageOption], {
    queryFn: () => bannerService.getListDetail(pageOption),
    enabled: checkPermission('banner.read'),
    onSuccess: data => {
      setData(data.data.data ?? [])
      setMeta(data.data.meta)
    }
  })

  const deleteMutation = useMutation(bannerService.delete, {
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
        queryClient.invalidateQueries('banner-list')
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

  const handleEdit = (data: BannerDetailType) => {
    setOpenForm(true)
    setSelectedData(data)
  }

  const handleDelete = (data: BannerDetailType) => {
    setSelectedData(data)
    setFormDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedData !== null && selectedData.banner_master.id) {
      setLoadingDelete(true)
      deleteMutation.mutate(selectedData.banner_master.id)
    }
  }

  const { mutate: setStatus } = useMutation(bannerService.setStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('banner-list')
    }
  })

  const setStatusData = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const [itemSelected, setItemSelected] = useState<BannerDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    bannerService.deleteBatch,
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
      mutateDeleteBatch(itemSelected.map(item => item.banner_master.id) as number[])
    }
  }

  const { mutate: setBatchStatus } = useMutation(bannerService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('banner-list')
    }
  })

  const setBatchStatusBanner = (status: boolean) => {
    const ids = itemSelected.map(item => item.banner_master.id) as number[]

    setBatchStatus({ ids, status })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    banner?: BannerDetailType
  ) => {
    if (id !== 'all') {
      if (banner && event.target.checked) setItemSelected([...itemSelected, banner])
      else if (banner && !event.target.checked)
        setItemSelected(
          itemSelected.filter(item => item.banner_master.id != banner.banner_master.id)
        )

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

  const columns: GridColDef<BannerDetailType>[] = [
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
            onChange={e => handleChange(e, index.row.banner_master.id.toString(), index.row)}
            key={index.row.banner_master.id}
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
        return index.api.getRowIndexRelativeToVisibleRows(index.row.banner_master.id) + 1
      }
    },
    {
      minWidth: 80,
      field: 'banner',
      headerName: t('Image') ?? 'Image',
      renderCell: (params: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderImageAws
              url={params.row.banner_images ? params.row.banner_images[0].image : ''}
              name={params.row.banner_master.name}
            />
          </Box>
        )
      }
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'name',
      headerName: t('Banner Name') ?? 'Banner Name',
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
          {params.row.banner_master.name}
        </Typography>
      )
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'url',
      headerName: t('Banner Link') ?? 'Banner Link',
      renderCell: params => (
        <Link href={params.row.banner_master.url}>{params.row.banner_master.url}</Link>
      )
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
              checked={params.row.banner_master.status}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                checkPermission('banner.update') &&
                  setStatusData(params.row.banner_master.id, event.target.checked)
              }}
            />
          }
          label={params.row.banner_master.status ? t('Active') : t('Disable')}
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
            {checkPermission('banner.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small'>
                  <Icon
                    icon='tabler:edit'
                    onClick={() => handleEdit(params.row)}
                    fontSize='0.875rem'
                  />
                </IconButton>
              </Tooltip>
            )}
            {checkPermission('banner.delete') && (
              <Tooltip title={t('Delete')} placement='top'>
                <IconButton size='small'>
                  <Icon
                    icon='tabler:trash'
                    onClick={() => handleDelete(params.row)}
                    fontSize='0.875rem'
                  />
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
      {checkPermission('banner.create') && (
        <TableHeader
          title='Banner'
          onAdd={handleAdd}
          valueSearch={search}
          onSearch={value => {
            setSearch(value)
            setPageOption({ ...pageOption, query: value })
          }}
        />
      )}
      <DataGridCustom
        getRowId={param => param.banner_master.id}
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
        {...(checkPermission('banner.delete') && {
          onDeleteButton: () => setDeleteBatchOpen(true)
        })}
        {...(checkPermission('banner.update') && {
          button: (
            <>
              {/* set active */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusBanner(true)}
                color='success'
              >
                {t('Active')}
              </Button>
              {/* set disable */}
              <Button
                variant='contained'
                onClick={() => setBatchStatusBanner(false)}
                color='warning'
              >
                {t('Disable')}
              </Button>
            </>
          )
        })}
      />
      <FormBanner
        selectBanner={selectedData}
        open={openForm}
        toggle={handleCloseFormDialog}
        setSelectBanner={setSelectedData}
      />
      <DialogConfirmation
        open={formDeleteOpen}
        handleClose={handleCloseDelete}
        handleConfirm={handleConfirmDelete}
        loading={loadingDelete}
        name='Banner'
      />
      <DialogConfirmation
        open={deleteBatchOpen}
        handleClose={() => setDeleteBatchOpen(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Banner'
      />
    </Box>
  )
}

export default BannerComponent
