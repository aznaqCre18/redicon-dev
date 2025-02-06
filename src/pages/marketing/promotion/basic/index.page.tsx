import { useEffect, useState } from 'react'
import { GridColDef } from '@mui/x-data-grid'
import { Typography, IconButton, Card, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useMutation, useQuery } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import FormPromotionBasicDialog from './FormPromotionBasicDialog'
import TableHeader from 'src/components/table/TableHeader'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { PromotionBasicType } from 'src/types/apps/promotion/basic'
import { promotionBasicService } from 'src/services/promotion/basic'
import { formatDateOnly } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'

const BasicPromotionPage = () => {
  const { t } = useTranslation()
  // const { checkPermission } = useAuth()
  // const queryClient = useQueryClient()
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
  const [selectData, setSelectData] = useState<PromotionBasicType | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedData, setSelectedData] = useState<string | null>(null)
  const [deleteData, setDeleteData] = useState(false)
  // const [deleteBatchData, setDeleteBatchData] = useState(false)

  // ** Query
  const [datas, setDatas] = useState<PromotionBasicType[]>([])
  const [dataMeta, setDataMeta] = useState<MetaType>()
  const { isLoading, refetch } = useQuery(['promotion-basic-list', pageOption], {
    queryFn: () => promotionBasicService.getList(pageOption),
    // enabled: checkPermission('brand.read'),
    onSuccess: data => {
      setDatas(data.data.data ?? [])
      setDataMeta(data.data.meta)
    }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(promotionBasicService.delete, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteData(false)
      setSelectedData(null)
    }
  })

  const handleToggle = () => {
    setOpenDialog(false)
    refetch()
    setSelectData(null)
  }

  const handleEdit = (data: PromotionBasicType) => {
    setSelectData(data)
    setOpenDialog(true)
  }

  const handleDelete = (id: string | null) => {
    setSelectedData(id)
    setDeleteData(true)
  }

  const handleCloseDeleteData = () => {
    setDeleteData(false)
    setSelectedData(null)
  }

  const handleConfirmDeleteData = () => {
    if (selectedData !== null) {
      mutate(selectedData)
    }
  }

  // const { mutate: setBatchStatus } = useMutation(promotionBasicService.batchUpdateStatus, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('promotion-basic-list')
  //   }
  // })

  // const setBatchStatusBrand = (status: boolean) => {
  //   const ids = itemSelected.map(item => item.id) as number[]

  //   setBatchStatus({ ids, status })
  // }

  // const [itemSelected, setItemSelected] = useState<PromotionBasicType[]>([])
  // const [checkedAll, setCheckedAll] = useState(false)
  // const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  // const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
  //   promotionBasicService.deleteBatchBrand,
  //   {
  //     onSuccess: data => {
  //       toast.success(t((data as unknown as ResponseType).data.message))
  //       refetch()
  //       setDeleteBatchData(false)
  //       setItemSelected([])
  //       setCheckedAll(false)
  //     }
  //   }
  // )

  // const handleConfirmDeleteBatchBrand = () => {
  //   if (itemSelected.length > 0) {
  //     mutateDeleteBatch(itemSelected.map(item => item.id) as number[])
  //   }
  // }

  // const { mutate: exportExcel } = useMutation(promotionBasicService.exportExcel, {
  //   onSuccess: data => {
  //     const url = window.URL.createObjectURL(new Blob([data.data as any]))
  //     const link = document.createElement('a')
  //     link.href = url
  //     link.setAttribute('download', 'brands.xlsx')
  //     link.click()

  //     toast.success(t('Success download file'))
  //   }
  // })

  // const handleChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   id: string,
  //   brand?: PromotionBasicType
  // ) => {
  //   if (id !== 'all') {
  //     if (brand && event.target.checked) setItemSelected([...itemSelected, brand])
  //     else if (brand && !event.target.checked)
  //       setItemSelected(itemSelected.filter(item => item.id != brand.id))

  //     setCheckedAll(false)
  //   } else {
  //     if (!isCheckboxIndeterminate()) {
  //       setCheckedAll(event.target.checked)
  //       if (event.target.checked) setItemSelected(datas)
  //       else if (!event.target.checked) setItemSelected([])
  //     } else {
  //       setItemSelected([])
  //     }
  //   }
  // }

  // const getHasChecked = () => {
  //   return itemSelected.length > 0
  // }

  // const { mutate: setStatus } = useMutation(promotionBasicService.updateStatus, {
  //   onSuccess: data => {
  //     toast.success(t((data as unknown as ResponseType).data.message))
  //     queryClient.invalidateQueries('promotion-basic-list')
  //   }
  // })

  // const setStatusBrand = (id: number, status: boolean) => {
  //   setStatus({ id: id, status })
  // }

  const columns: GridColDef<PromotionBasicType>[] = [
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
      flex: 1,
      field: 'outlet_name',
      headerName: t('Outlet') ?? 'Outlet',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.outlet_name}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'description',
      headerName: t('Description') ?? 'Description',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.description}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'start_date',
      headerName: t('Start Date') ?? 'Start Date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatDateOnly(params.row?.start_date)}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'end_date',
      headerName: t('End Date') ?? 'End Date',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatDateOnly(params.row?.end_date)}
        </Typography>
      )
    },
    {
      flex: 1,
      field: 'discount_value',
      headerName: t('Discount') ?? 'Discount',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row?.discount_type === 'percentage' ? `${params.row?.discount_value}%` : ''}
          {params.row?.discount_type === 'nominal' && formatPriceIDR(params.row?.discount_value)}
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
            {/* {checkPermission('brand.update') && ( */}
            <Tooltip title={t('Edit')} placement='top'>
              <IconButton size='small' onClick={() => handleEdit(params.row)}>
                <Icon icon='tabler:edit' fontSize='0.875rem' />
              </IconButton>
            </Tooltip>
            {/* )} */}
            {/* {checkPermission('brand.delete') && ( */}
            <Tooltip title={t('Delete')} placement='top'>
              <IconButton size='small' onClick={() => handleDelete(params.row.id!.toString())}>
                <Icon icon='tabler:trash' fontSize='0.875rem' />
              </IconButton>
            </Tooltip>
            {/* )} */}
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
        title={t('Basic Promotion')}
        {
          // checkPermission('brand.create') &&
          ...{
            onAdd: () => setOpenDialog(true)
          }
        }
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
          setPageOption({ ...pageOption, query: value })
        }}
      />
      <DataGridCustom
        loading={isLoading}
        autoHeight
        rows={datas ?? []}
        columns={columns}
        disableColumnMenu
        hideFooter
        setPaginationData={setPageOption}
      />
      <PaginationCustom
        itemSelected={[]}
        // itemSelected={itemSelected}
        meta={dataMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        // {...(
        //   checkPermission('brand.delete') &&
        //   {
        //   onDeleteButton: () => setDeleteBatchData(true)
        // })}
        // button={
        //   <>
        //     {checkPermission('brand.update') && (
        //       <>
        //         {/* set active */}
        //         <Button
        //           variant='contained'
        //           onClick={() => setBatchStatusBrand(true)}
        //           color='success'
        //         >
        //           {t('Active')}
        //         </Button>
        //         {/* set disable */}
        //         <Button
        //           variant='contained'
        //           onClick={() => setBatchStatusBrand(false)}
        //           color='warning'
        //         >
        //           {t('Disable')}
        //         </Button>
        //       </>
        //     )}
        //   </>
        // }
      />
      <FormPromotionBasicDialog open={openDialog} toggle={handleToggle} selectData={selectData} />
      <DialogConfirmation
        open={deleteData}
        handleClose={handleCloseDeleteData}
        handleConfirm={handleConfirmDeleteData}
        loading={isLoadingDelete}
        name='Basic Promotion'
      />
      {/* <DialogConfirmation
        open={deleteBatchData}
        handleClose={() => setDeleteBatchData(false)}
        handleConfirm={handleConfirmDeleteBatchBrand}
        loading={isLoadingDeleteBatch}
        name='Brand'
      /> */}
    </Card>
  )
}

export default BasicPromotionPage
