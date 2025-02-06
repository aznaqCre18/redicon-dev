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
import { categoryService } from 'src/services/category'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import { CategoryType } from 'src/types/apps/categoryType'
import { useAuth } from 'src/hooks/useAuth'
import RenderImageAws from 'src/components/image/RenderImagesAws'
import FormCategoryDialog from './FormCategoryDialog'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import TableHeader from 'src/views/setting/components/TableHeader'

const CategoryContent = () => {
  const { t } = useTranslation()
  const { checkPermission } = useAuth()
  const router = useRouter()

  const [pageOption, setPageOption] = useState<PageOptionRequestType>({
    ...{ ...defaultPagination, order: 'created_at' },
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
  const queryClient = useQueryClient()

  const [search, setSearch] = useState<string>((pageOption.name as any) ?? '')

  // Filter Outlet
  // const [filterOutletVal, setFilterOutletVal] = useState<string>(
  //   (pageOption.outlet_ids as any) ?? ''
  // )
  // const outletSelectedArr = filterOutletVal
  //   ? filterOutletVal.split(',').map(item => parseInt(item))
  //   : []

  const [lastPosition, setLastPosition] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
  const [isOpenDialog, setOpenDialog] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState(false)

  const [unitMeta, setUnitMeta] = useState<MetaType>()
  const [dataCategories, setDataCategories] = useState<CategoryType[]>([])
  const [deleteBatch, setDeleteBatch] = useState(false)

  // ** Query
  useQuery(['categories-list', pageOption], {
    queryFn: () => categoryService.getListCategoriesDetail(pageOption),
    enabled: checkPermission('category.read'),
    onSuccess: data => {
      const _categoriesData: CategoryType[] = []
      data.data.data.map(categories => {
        categories.category.display_name = categories.category.name
        _categoriesData.push(categories.category)

        categories.children.map(categoriesChild => {
          const _data = JSON.parse(JSON.stringify(categoriesChild.category))
          _data.display_name = categories.category.name + ' / ' + categoriesChild.category.name
          _categoriesData.push(_data)
        })
      })

      setDataCategories(_categoriesData)

      setUnitMeta({
        page: defaultPagination.page,
        per_page: defaultPagination.limit,
        total_count: _categoriesData.length,
        total_pages: 1
      })

      setLastPosition(
        _categoriesData.reduce((prev, current) =>
          prev.position > current.position ? prev : current
        ).position
      )
    }
  })

  // const [outlets, setOutlets] = useState<OutletType[]>([])
  // useQuery('outlets-list', {
  //   queryFn: () => outletService.getListOutlet(maxLimitPagination),
  //   onSuccess: data => {
  //     setOutlets(data.data.data)
  //   }
  // })

  const { mutate, isLoading } = useMutation(categoryService.deleteCategory, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('categories-list')
      setDeleteCategory(false)
      setSelectedCategory(null)
    }
  })

  // ** Handle
  const handleToggle = () => {
    setOpenDialog(false)
  }

  const handleAdd = () => {
    setSelectedCategory(null)
    setOpenDialog(true)
  }

  const handleEdit = (data: CategoryType) => {
    setSelectedCategory(data)
    setOpenDialog(true)
  }

  const handleDelete = (data: CategoryType) => {
    setSelectedCategory(data)
    setDeleteCategory(true)
  }

  const handleCloseDeleteCategory = () => {
    setDeleteCategory(false)
    setSelectedCategory(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (selectedCategory !== null) {
      mutate(selectedCategory.id)
    }
  }

  const { mutate: setBatchStatus } = useMutation(categoryService.batchUpdateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('categories-list')
    }
  })

  const setBatchStatusCategory = (status: boolean) => {
    const ids = itemSelected.map(item => item.id) as number[]

    setBatchStatus({ ids, status })
  }

  const [itemSelected, setItemSelected] = useState<CategoryType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)
  const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    categoryService.deleteBatchCategory,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        queryClient.invalidateQueries('categories-list')
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

  const { mutate: exportExcel } = useMutation(categoryService.exportExcel, {
    onSuccess: data => {
      const url = window.URL.createObjectURL(new Blob([data.data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'categories.xlsx')
      link.click()

      toast.success(t('Success download file'))
    }
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
    category?: CategoryType
  ) => {
    if (id !== 'all') {
      if (category && event.target.checked) setItemSelected([...itemSelected, category])
      else if (category && !event.target.checked)
        setItemSelected(itemSelected.filter(item => item.id != category.id))

      setCheckedAll(false)
    } else {
      if (!isCheckboxIndeterminate()) {
        setCheckedAll(event.target.checked)
        if (event.target.checked) setItemSelected(dataCategories)
        else if (!event.target.checked) setItemSelected([])
      } else {
        setItemSelected([])
      }
    }
  }

  const getHasChecked = () => {
    return itemSelected.length > 0
  }

  const { mutate: setStatus } = useMutation(categoryService.updateStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('categories-list')
    }
  })

  const setStatusCategory = (id: number, status: boolean) => {
    setStatus({ id: id, status })
  }

  const { mutate: setShowOnPos } = useMutation(categoryService.updateShowOnPOS, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('categories-list')
    }
  })

  const handleShowOnPos = (id: number, status: boolean) => {
    setShowOnPos({ id: id, status })
  }

  const columns: GridColDef<CategoryType>[] = [
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
      width: 22,
      field: 'no',
      headerName: t('No') ?? 'No',
      sortable: false,
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.id) ?? 1) +
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
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderImageAws url={params.row.image} name={params.row.name} />
          </Box>
        )
      }
    },
    {
      width: 300,
      field: 'name',
      headerName: t('Category') ?? 'Category',
      renderCell: (params: { row: CategoryType }) => {
        const { row } = params

        return (
          <Typography
            className='hover-underline'
            variant='body2'
            onClick={() => handleEdit(row)}
            sx={{
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            {row.display_name}
          </Typography>
        )
      }
    },
    // {
    //   flex: 1,
    //   field: 'outlet_name',
    //   headerName: t('Outlet') ?? 'Outlet',
    //   renderCell: params => {
    //     return (
    //       <Tooltip
    //         title={(params.row.outlets ?? [])
    //           .filter(outlet => outlet.status == 'Active')
    //           .map(outlet => outlet.name)
    //           .join(', ')}
    //         placement='top'
    //       >
    //         <Typography variant='body2' noWrap>
    //           {(params.row.outlets?.filter(outlet => outlet.status == 'Active') ?? []).length ==
    //           outlets.length
    //             ? t('All') + ' ' + t('Outlet')
    //             : (params.row.outlets ?? [])
    //                 .filter(outlet => outlet.status == 'Active')
    //                 .map(outlet => outlet.name)
    //                 .join(', ')}

    //           {(params.row.outlets ?? []).length == 0 && t('All') + ' ' + t('Outlet')}
    //         </Typography>
    //       </Tooltip>
    //     )
    //   }
    // },
    {
      flex: 1,
      field: 'position',
      headerName: t('Position') ?? 'Position'
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
                checkPermission('category.update') &&
                  setStatusCategory(params.row.id, event.target.checked)
              }}
            />
          }
          label={params.row.is_active ? t('Active') : t('Disable')}
        />
      )
    },
    // {
    //   field: 'is_show_on_pos',
    //   headerName: t('Show On POS') ?? 'Show On POS',
    //   flex: 1,
    //   renderCell: params => (
    //     <FormControlLabel
    //       control={
    //         <Switch
    //           checked={params.row.is_show_on_pos != null && params.row.is_show_on_pos}
    //           onChange={(event: ChangeEvent<HTMLInputElement>) => {
    //             checkPermission('category.update') &&
    //               handleShowOnPos(params.row.id, event.target.checked)
    //           }}
    //         />
    //       }
    //       label={params.row.is_show_on_pos ? t('Active') : t('Disable')}
    //     />
    //   )
    // },
    {
      cellClassName: 'column-action',
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <>
            {checkPermission('category.update') && (
              <Tooltip title={t('Edit')} placement='top'>
                <IconButton size='small' onClick={() => handleEdit(params.row)}>
                  <Icon icon='tabler:edit' fontSize='0.875rem' />
                </IconButton>
              </Tooltip>
            )}
            {!params.row.is_default && checkPermission('category.delete') && (
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

  useEffect(() => {
    delete pageOption.name
    // delete pageOption.outlet_ids

    setPageOption(old => ({
      ...old,
      name: search === '' ? undefined : search
      // outlet_ids: filterOutletVal === 'all' ? undefined : filterOutletVal
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <Card
      sx={{
        mb: '50px'
      }}
    >
      <TableHeader
        title={t('Category')}
        {...(checkPermission('category.create') && {
          onAdd: handleAdd
        })}
        valueSearch={search}
        onSearch={value => {
          setSearch(value)
        }}
        // filterComponent={[
        //   <FilterOutlet
        //     key={0}
        //     value={outletSelectedArr}
        //     onChange={value => setFilterOutletVal(value?.join(',') ?? '')}
        //   />
        // ]}
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
        getRowId={row => row.id}
        autoHeight
        rows={dataCategories ?? []}
        columns={columns}
        disableColumnMenu
        disableRowSelectionOnClick
        hideFooter
        setPaginationData={setPageOption}
        // columnVisibilityModel={{
        //   outlet_name: outlets.length > 1 ? true : false
        // }}
      />
      <PaginationCustom
        itemSelected={itemSelected}
        meta={unitMeta}
        onChangePagination={(page, limit) => setPageOption(old => ({ ...old, page, limit }))}
        {...(checkPermission('category.delete') && {
          onDeleteButton: () => setDeleteBatch(true)
        })}
        button={
          <>
            {checkPermission('category.update') && (
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
      <FormCategoryDialog
        lastPosition={lastPosition}
        open={isOpenDialog}
        toggle={handleToggle}
        selectCategory={selectedCategory}
      />
      <DialogConfirmation
        open={deleteCategory}
        handleClose={handleCloseDeleteCategory}
        handleConfirm={handleConfirmDeleteCategory}
        loading={isLoading}
        name='Category'
      />
      <DialogConfirmation
        open={deleteBatch}
        handleClose={() => setDeleteBatch(false)}
        handleConfirm={handleConfirmDeleteBatch}
        loading={isLoadingDeleteBatch}
        name='Category'
      />
    </Card>
  )
}

export default CategoryContent
