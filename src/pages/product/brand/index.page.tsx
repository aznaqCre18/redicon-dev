import { ChangeEvent, useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { GridColDef } from '@mui/x-data-grid'
import {
  Typography,
  IconButton,
  Checkbox,
  Card,
  FormControlLabel,
  Switch,
  Tooltip,
  Button
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { brandService } from 'src/services/brand'
import { BrandType } from 'src/types/apps/brandType'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { useAuth } from 'src/hooks/useAuth'
import FormBrandDialog from './FormBrandDialog'
import RenderImageAws from 'src/components/image/RenderImagesAws'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

const BrandContent = () => {
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
  const [selectBrand, setSelectBrand] = useState<BrandType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [deleteBrand, setDeleteBrand] = useState(false)
  const [deleteBatchBrand, setDeleteBatchBrand] = useState(false)

  // ** Query
  const [brandsData, setBrandsData] = useState<BrandType[]>([])
  const [brandMeta, setBrandMeta] = useState<MetaType>()
  const { isLoading, refetch } = useQuery(['brands-list', pageOption], {
    queryFn: () => brandService.getListBrand(pageOption),
    enabled: checkPermission('brand.read'),
    onSuccess: data => {
      setBrandsData(data.data.data ?? [])
      setBrandMeta(data.data.meta)
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(brandService.deleteBrand, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteBrand(false)
      setSelectedBrand(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectBrand(null)
  }

  const handleEdit = (brand: BrandType) => {
    setSelectBrand(brand)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedBrand(id)
    setDeleteBrand(true)
  }

  const handleCloseDeleteBrand = () => {
    setDeleteBrand(false)
    setSelectedBrand(null)
  }

  const handleConfirmDeleteBrand = () => {
    if (selectedBrand !== null) {
      mutate(selectedBrand)
    }
  }

  const { mutate: setBatchStatus } = useMutation(brandService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('brands-list')
    }
  })

  const setBatchStatusBrand = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const [itemSelected, setItemSelected] = useState<BrandType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    brandService.deleteBatchBrand,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatchBrand(false)
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

  const { mutate: exportExcel } = useMutation(brandService.exportExcel, {
    onSuccess: data => {
      const url = window.URL.createObjectURL(new Blob([data.data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'brands.xlsx')
      link.click()

      toast.success(t('Success download file'))
    }
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    brand?: BrandType
  ) => {
    if (id !== 'all') {
      if (brand && event.target.checked) setItemSelected([...itemSelected, brand])
      else if (brand && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != brand.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(brandsData)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(brandService.updateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('brands-list')
    }
  })

  const setStatusBrand = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const columns: GridColDef<BrandType>[] = [
    {
      cellClassName: 'padding-left-01rem',
      headerClassName: 'padding-left-01rem',
      width: 42,
      headerName: 'Checkbox',
      field: 'checkbox',
      renderCell: (index: { row: BrandType }) => {
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
      width: 80,
      field: 'image',
      headerName: t('Image') ?? 'Image',
      sortable: false,
      renderCell: params => {
        // const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderImageAws url={params.row.image} name={params.row.name} />
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'code',
      headerName: t('Code') ?? 'Code',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.code}
        </Typography>
      )
    },
    {
      width: 300,
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
          {params.row?.name}
        </Typography>
      )
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
                if (params.row.id && checkPermission('brand.update'))
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
            {checkPermission('brand.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_default && checkPermission('brand.delete') && (
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
        title={t('Brand')}
        {...(checkPermission('brand.create') && {
          onAdd: () => setOpenDialog(true)
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      >
        {/* <Button
          variant='outlined'
          onClick={() => exportExcel()}
          startIcon={<Icon icon='file-icons:microsoft-excel' />}
        >
          {t('Export')}
        </Button> */}
      </TableHeader>
      <DataGridCustom
        loading={isLoading}
        autoHeight
        rows={brandsData ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={brandMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('brand.delete') && {
          onDeleteButton: () => setDeleteBatchBrand(true)
        })}
        button={
          <>
            {checkPermission('brand.update') && (
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
      <FormBrandDialog open={openDialog} toggle={handleToggle} selectBrand={selectBrand} />
      <DialogConfirmation
        open={deleteBrand}
        handleClose={handleCloseDeleteBrand}
        handleConfirm={handleConfirmDeleteBrand}
        loading={isLoadingDelete}
        name='Brand'
      />
      <DialogConfirmation
        open={deleteBatchBrand}
        handleClose={() => setDeleteBatchBrand(false)}
        handleConfirm={handleConfirmDeleteBatchBrand}
        loading={isLoadingDeleteBatch}
        name='Brand'
      />
    </Card>
  )
}

export default BrandContent
