import { MouseEvent, memo, useEffect, useState } from 'react'

import Card from '@mui/material/Card'

import { useMutation, useQuery, useQueryClient } from 'react-query'

import Icon from 'src/@core/components/icon'
import { Button, Tab, TextField, InputAdornment, Box, Grid } from '@mui/material'
import Link from 'next/link'
import DialogFilter from './components/DialogFilter'
import { TabContext, TabList } from '@mui/lab'
import DialogPriceStockManagement from './components/DialogPriceStockManagement'
import { productService } from 'src/services/product'
import { ProductDetailType, ProductStatusCountType } from 'src/types/apps/productType'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
// import { manipulateRows } from 'src/@core/utils/manipulate-rows'
import { categoryService } from 'src/services/category'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { brandService } from 'src/services/brand'
import { useAuth } from 'src/hooks/useAuth'
import { CRUDPermission } from 'src/utils/permissionUtils'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useTranslation } from 'react-i18next'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { BrandType } from 'src/types/apps/brandType'
import { useRouter } from 'next/router'
import TableProduct from './components/TableProduct'
import { TableColumnSortProp } from 'src/components/table/TableCustom'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { rangeDateValue } from 'src/utils/apiUtils'
import ButtonExport from './components/ButtonExport'
import ButtonImport from './components/ButtonImport'
import FilterSupplier from 'src/components/filter/FilterSupplier'
import { useData } from 'src/hooks/useData'

const defaultPaginationProduct = defaultPagination
defaultPaginationProduct.order = 'updated_at'
defaultPaginationProduct.sort = 'desc'

const ProductList = memo(() => {
  const router = useRouter()

  const { supplierData } = useData()

  const [paginationData, setPaginationData] = useState<PageOptionRequestType>({
    ...defaultPaginationProduct,
    ...router.query
  } as any)

  useEffect(() => {
    router.replace({
      query: paginationData
    })
    // setIsLoading(true)
    // setProductData([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationData])

  const { t } = useTranslation()
  const { checkPermission, permissions } = useAuth()
  const queryClient = useQueryClient()
  // const [isLoading, setIsLoading] = useState(true)
  const [productData, setProductData] = useState<ProductDetailType[]>([])
  const [productMeta, setProductMeta] = useState<MetaType>()
  const [deleteProduct, setDeleteProduct] = useState(false)
  const [selectDelete, setSelectDelete] = useState<number | null>(null)

  const [productPermission, setProductPermission] = useState<CRUDPermission>({
    create: false,
    read: true,
    update: false,
    delete: false
  })

  useEffect(() => {
    setProductPermission({
      create: checkPermission('product.create'),
      read: checkPermission('product.read'),
      update: checkPermission('product.update'),
      delete: checkPermission('product.delete')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions])

  const onHandleSearch = (value: string) => {
    setPaginationData({ ...paginationData, query: value, page: 1 })
  }

  const [search, setSearch] = useState<string>((paginationData.query as string) ?? '')

  useEffect(() => {
    onHandleSearch(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const [categoryFilterVal, setCategoryFilterVal] = useState<number | undefined>(
    (paginationData.category_id as number) ?? undefined
  )
  const { data: categoriesData } = useQuery('category-list', {
    queryFn: () => categoryService.getListCategoriesDetailActive(maxLimitPagination)
  })

  const [supplierFilterVal, setSupplierFilterVal] = useState<number[]>([])

  useEffect(() => {
    if (categoryFilterVal)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.category_id = categoryFilterVal
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.category_id
        data.page = 1

        return data
      })
  }, [categoryFilterVal])

  useEffect(() => {
    if (supplierFilterVal.length > 0)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.supplier_id = supplierFilterVal.join(',')
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.supplier_id
        data.page = 1

        return data
      })
  }, [supplierFilterVal])

  const channelData: any[] = []
  const storeData: any[] = []

  const [outletFilterVal, setOutletFilterVal] = useState<number | null>(
    (paginationData.outlet_id as number) ?? null
  )

  // const [outletData, setOutletData] = useState<OutletType[]>([])
  // useQuery('outlet-list', {
  //   queryFn: () => outletService.getListOutlet(maxLimitPagination),
  //   onSuccess: data => {
  //     setOutletData(data.data.data ?? [])
  //   }
  // })
  const outletData: OutletType[] = []

  const [productStatusCount, setProductStatusCount] = useState<ProductStatusCountType | undefined>()

  useQuery(['product-status-count', paginationData], {
    queryFn: () => productService.getProductStatusCount(paginationData),
    onSuccess: data => {
      setProductStatusCount(data.data.data)
    }
  })

  useEffect(() => {
    if (outletFilterVal)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.outlet_id = outletFilterVal
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.outlet_id
        data.page = 1

        return data
      })
  }, [outletFilterVal])

  type labelOptionType =
    | 'Terbaru'
    | 'Terlaris'
    | 'Diskon'
    | 'Grosir'
    | 'Sold Out'
    | 'Promo'
    | 'Video'
    | 'all'
  const [labelFilterVal, setLabelFilterVal] = useState<labelOptionType>(
    (paginationData.labels as any) ?? 'all'
  )
  const labelOptions: SelectOption[] = [
    {
      value: 'all',
      label: t('Semua')
    },
    {
      value: 'Terbaru',
      label: t('Terbaru')
    },
    {
      value: 'Terlaris',
      label: t('Terlaris')
    },
    {
      value: 'Diskon',
      label: t('Diskon')
    },
    {
      value: 'Promo',
      label: t('Promo')
    },
    {
      value: 'Grosir',
      label: t('Grosir')
    },
    {
      value: 'Sold Out',
      label: t('Sold Out')
    },
    {
      value: 'video',
      label: t('Video')
    }
  ]

  useEffect(() => {
    if (labelFilterVal != 'all')
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.labels = labelFilterVal
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.labels
        data.page = 1

        return data
      })
  }, [labelFilterVal])

  type sortingByOptionType =
    | 'none'
    | 'Terbaru'
    | 'Terlaris'
    | 'Diskon'
    | 'Grosir'
    | 'Sold Out'
    | 'Promo'
    | 'Video'
    | 'all'
  const [sortingByVal, setSortingByVal] = useState<sortingByOptionType>('none')
  const sortingByOptions: SelectOption[] = [
    {
      value: 'none',
      label: t('No Sorting')
    },
    {
      value: 'name-asc',
      label: t('A-Z Nama Product')
    },
    {
      value: 'name-desc',
      label: t('Z-A Nama Product')
    },
    {
      value: 'stock-desc',
      label: t('Stok Tertinggi')
    },
    {
      value: 'stock-asc',
      label: t('Stok Terendah')
    },
    {
      value: 'price-desc',
      label: t('Harga Jual Tertinggi')
    },
    {
      value: 'price-asc',
      label: t('Harga Jual Terendah')
    },
    {
      value: 'sold_quantity-desc',
      label: t('Terlaris')
    },
    {
      value: 'sold_quantity-asc',
      label: t('Tidak Terjual')
    }
  ]

  useEffect(() => {
    const data = JSON.parse(JSON.stringify(paginationData))

    if (sortingByVal != 'none')
      setPaginationData(() => {
        const split = sortingByVal.split('-')
        const order = split[0]
        const sort = split[1]

        data.order = order
        data.sort = sort
        data.page = 1

        return data
      })
    // else if (data.order != 'updated_at' && data.sort != 'desc')
    //   setPaginationData(() => {
    //     data.order = 'updated_at'
    //     data.sort = 'desc'
    //     data.page = 1

    //     return data
    //   })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortingByVal])

  const [brandFilterVal, setBrandFilterVal] = useState<number | undefined>(
    (paginationData.brand_id as number) ?? undefined
  )
  const [brandData, setBrandData] = useState<BrandType[]>([])
  useQuery('brand-list', {
    queryFn: () => brandService.getListBrandActive(maxLimitPagination),
    onSuccess: data => {
      setBrandData(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (brandFilterVal)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.brand_id = brandFilterVal
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.brand_id
        data.page = 1

        return data
      })
  }, [brandFilterVal])

  const createAtFiletFromQuery =
    paginationData.created_at != undefined
      ? (paginationData.created_at as string).split('~')
      : undefined

  const defaultStartCreatedAtFromQuery = createAtFiletFromQuery
    ? new Date(createAtFiletFromQuery[0])
    : undefined
  const defaultEndCreatedAtFromQuery = createAtFiletFromQuery
    ? new Date(createAtFiletFromQuery[1])
    : undefined

  const [startCreatedAtDateRange, setStartCreatedAtDateRange] = useState<DateType | undefined>(
    defaultStartCreatedAtFromQuery
  )

  const [endCreatedAtDateRange, setEndCreatedAtDateRange] = useState<DateType | undefined>(
    defaultEndCreatedAtFromQuery
  )

  const updatedAtFiletFromQuery =
    paginationData.updated_at != undefined
      ? (paginationData.updated_at as string).split('~')
      : undefined

  const defaultStartUpdatedAtFromQuery = updatedAtFiletFromQuery
    ? new Date(updatedAtFiletFromQuery[0])
    : undefined

  const defaultEndUpdatedAtFromQuery = updatedAtFiletFromQuery
    ? new Date(updatedAtFiletFromQuery[1])
    : undefined

  const [startUpdatedAtDateRange, setStartUpdatedAtDateRange] = useState<DateType | undefined>(
    defaultStartUpdatedAtFromQuery
  )

  const [endUpdatedAtDateRange, setEndUpdatedAtDateRange] = useState<DateType | undefined>(
    defaultEndUpdatedAtFromQuery
  )

  useEffect(() => {
    if (startCreatedAtDateRange && endCreatedAtDateRange)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.created_at = rangeDateValue(startCreatedAtDateRange, endCreatedAtDateRange)
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.created_at
        data.page = 1

        return data
      })
  }, [startCreatedAtDateRange, endCreatedAtDateRange])

  useEffect(() => {
    if (startUpdatedAtDateRange && endUpdatedAtDateRange)
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        data.updated_at = rangeDateValue(startUpdatedAtDateRange, endUpdatedAtDateRange)
        data.page = 1

        return data
      })
    else
      setPaginationData(prev => {
        const data = JSON.parse(JSON.stringify(prev))
        delete data.updated_at
        data.page = 1

        return data
      })
  }, [startUpdatedAtDateRange, endUpdatedAtDateRange])

  const resetFilter = () => {
    setSearch('')
    setCategoryFilterVal(undefined)
    setSupplierFilterVal([])
    setOutletFilterVal(null)
    setBrandFilterVal(undefined)
    setLabelFilterVal('all')
    setSortingByVal('none')

    setStartCreatedAtDateRange(null)
    setEndCreatedAtDateRange(null)

    setStartUpdatedAtDateRange(null)
    setEndUpdatedAtDateRange(null)

    setPaginationData(prev => {
      prev.order = 'updated_at'
      prev.sort = 'desc'

      return prev
    })
  }

  const [openFilter, setOpenFilter] = useState(false)
  const [tabValue, setTabValue] = useState((paginationData.status as any) ?? 'live')
  const [itemSelected, setItemSelected] = useState<ProductDetailType[]>([])
  const [checkedAll, setCheckedAll] = useState(false)

  const refetch = () => {
    queryClient.invalidateQueries('product-status-count')
    queryClient.invalidateQueries('product-list')
  }

  const resetChecked = () => {
    setItemSelected([])
    setCheckedAll(false)
  }

  useEffect(() => {
    resetChecked()

    setPaginationData(prev => {
      const data = JSON.parse(JSON.stringify(prev))
      data.status = tabValue
      data.page = 1

      return data
    })
  }, [tabValue])

  const [openDialogPriceAndStock, setOpenDialogPriceAndStock] = useState<number | undefined>(
    undefined
  )

  const closeDialogManagement = () => {
    setOpenDialogPriceAndStock(undefined)
  }

  const { mutate: batchUpdate } = useMutation(productService.patchBatchStatus, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()
      setDeleteBatch(false)
      resetChecked()
      setCheckedAll(false)
    },
    onError: () => {
      toast.error('Failed to update status')
    }
  })

  const batchUpdateStatus = (status: string) => {
    if (itemSelected.length > 0) {
      batchUpdate(
        itemSelected.map(item => ({
          id: Number(item.product.id),
          status: status
        }))
      )
    }
  }

  const [deleteBatch, setDeleteBatch] = useState(false)

  const { mutate: mutateDeleteBatch, isLoading: isLoadingDeleteBatch } = useMutation(
    productService.deleteBatchProduct,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
        refetch()
        setDeleteBatch(false)
        resetChecked()
        setCheckedAll(false)
      }
    }
  )

  const { isLoading } = useQuery(['product-list', paginationData], {
    queryFn: () => productService.getListProductDetail(paginationData),
    enabled: productPermission.read,
    cacheTime: 0,
    onSuccess: data => {
      // setIsLoading(false)
      setProductData(data.data.data ?? [])
      setProductMeta(data.data.meta)
    }
    // onError: () => {
    //   setIsLoading(false)
    // }
  })

  const { mutate, isLoading: isLoadingDelete } = useMutation(productService.deleteProduct, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      refetch()

      setDeleteProduct(false)
      setSelectDelete(null)
    }
  })

  // useQuery(['product-data', showAllVariantId], {
  //   queryFn: () => productService.getProductDetail(showAllVariantId?.toString() ?? undefined),
  //   onSuccess: response => {
  //     if (response) setshowAllVariant(response.data.data)
  //   }
  // })

  const onColumnSorting = (data: TableColumnSortProp) => {
    setPaginationData(old => ({
      ...old,
      order: data.column,
      sort: data.sort,
      page: 1
    }))
  }

  const handleConfirmDeleteBatch = () => {
    if (itemSelected.length > 0) {
      mutateDeleteBatch(itemSelected.map(item => item.product.id) as number[])
    }
  }

  const handleCloseDeleteProduct = () => {
    setDeleteProduct(false)
    setSelectDelete(null)
  }

  const handleConfirmDeleteProduct = () => {
    if (selectDelete !== null) {
      mutate(selectDelete)
    }
  }

  // Dropdown Add
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  return (
    <>
      <Card style={{ marginBottom: '50px' }}>
        <DialogFilter open={openFilter} onClose={() => setOpenFilter(false)} />
        <DialogPriceStockManagement
          productId={openDialogPriceAndStock}
          onClose={() => closeDialogManagement()}
        />
        <Box
          p={4}
          sx={{
            display: 'flex',
            alignItems: 'top',
            alignContent: 'space-between',
            gap: 1
          }}
        >
          <Grid item xs={11.6} container spacing={1} rowSpacing={3} columns={13}>
            <Grid item xs={2.4}>
              <TextField
                fullWidth
                value={search}
                variant='outlined'
                className='text-input-group'
                placeholder={t('Search') + ' ' + t('Product') + '...'}
                size='small'
                onChange={e => {
                  setSearch(e.target.value ?? '')
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position='end'
                      sx={{
                        cursor: 'pointer'
                      }}
                      // onClick={() => alert('search')}
                    >
                      <Icon fontSize='1.125rem' icon='tabler:search' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            {channelData.length > 0 && (
              <Grid item xs={1.6}>
                <SelectCustom
                  fullWidth
                  isFloating
                  optionKey={'id'}
                  labelKey={'name'}
                  label='Channel'
                  options={channelData}
                />
              </Grid>
            )}
            {storeData.length > 0 && (
              <Grid item xs={1.6}>
                <SelectCustom
                  isFloating
                  optionKey={'id'}
                  labelKey={'name'}
                  label='Store'
                  options={storeData}
                />
              </Grid>
            )}
            {/* {outletData.length > 1 && ( */}
            {/* <Grid item xs={1.6}>
              <SelectCustom
                isFloating
                value={outletFilterVal}
                onSelect={outlet => {
                  setOutletFilterVal(outlet?.id ?? null)
                }}
                minWidthPaper={280}
                optionKey={'id'}
                labelKey={'name'}
                label={t('Outlet') ?? 'Outlet'}
                options={outletData ?? []}
                {...(outletData.length == 1 && {
                  defaultValueId: outletData[0]
                })}
              />
            </Grid> */}
            {/* )} */}
            {categoriesData && (
              <Grid item xs={1.8}>
                <SelectCustom
                  isFloating
                  value={categoryFilterVal}
                  onSelect={category => {
                    setCategoryFilterVal(category?.category.id ?? undefined)
                  }}
                  minWidthPaper={280}
                  optionKey={['category', 'id']}
                  labelKey={['category', 'name']}
                  label={t('Category') ?? 'Category'}
                  options={categoriesData?.data.data ?? []}
                  {...(categoriesData?.data.data.length == 1 && {
                    defaultValueId: categoriesData?.data.data[0]
                  })}
                />
              </Grid>
            )}
            {supplierData.length > 1 && (
              <Grid item xs={2.3}>
                <FilterSupplier
                  width={'auto'}
                  value={supplierFilterVal}
                  isFloating
                  onChange={value => {
                    setSupplierFilterVal(value ?? [])
                  }}
                />
              </Grid>
            )}
            {/* {brandData && brandData.length > 1 && (
              <Grid item xs={1.6}>
                <SelectCustom
                  isFloating
                  value={brandFilterVal}
                  onSelect={brand => {
                    setBrandFilterVal(brand?.id ?? undefined)
                  }}
                  optionKey={'id'}
                  labelKey={'name'}
                  label={t('Brand') ?? 'Brand'}
                  options={brandData}
                  {...(brandData.length == 1 && {
                    defaultValueId: brandData[0]
                  })}
                />
              </Grid>
            )} */}
            {/* <Grid item xs={1.5}>
              <Select
                label={t(`Filter ${t('Product')}`)}
                value={labelFilterVal}
                onChange={e => {
                  e.target.value
                    ? setLabelFilterVal(e.target.value as labelOptionType)
                    : setLabelFilterVal('all')
                }}
                fullWidth
                options={labelOptions}
              />
            </Grid> */}
            <Grid item xs={6} container columns={12} spacing={1}>
              {/* <Grid item xs={3}>
                <PickersRangeMonth
                  hideIconDate
                  label={t('Created At') ?? 'Created At'}
                  startDate={startCreatedAtDateRange}
                  endDate={endCreatedAtDateRange}
                  defaultStartDate={undefined}
                  defaultEndDate={undefined}
                  onChangeDateRange={(start, end) => {
                    if (start && end) {
                      setStartCreatedAtDateRange(start)
                      setEndCreatedAtDateRange(end)
                    }

                    if (start == null && end == null) {
                      setStartCreatedAtDateRange(undefined)
                      setEndCreatedAtDateRange(undefined)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <PickersRangeMonth
                  hideIconDate
                  label={t('Updated At') ?? 'Updated At'}
                  startDate={startUpdatedAtDateRange}
                  endDate={endUpdatedAtDateRange}
                  defaultStartDate={undefined}
                  defaultEndDate={undefined}
                  onChangeDateRange={(start, end) => {
                    if (start && end) {
                      setStartUpdatedAtDateRange(start)
                      setEndUpdatedAtDateRange(end)
                    }

                    if (start == null && end == null) {
                      setStartUpdatedAtDateRange(undefined)
                      setEndUpdatedAtDateRange(undefined)
                    }
                  }}
                />
              </Grid> */}
              {/* <Grid item xs={3}>
                <Select
                  label={t(`Sorting by`)}
                  value={sortingByVal}
                  onChange={e => {
                    e.target.value
                      ? setSortingByVal(e.target.value as sortingByOptionType)
                      : setSortingByVal('none')
                  }}
                  fullWidth
                  options={sortingByOptions}
                />
              </Grid> */}
              <Grid item xs={3}>
                <Button variant='outlined' onClick={resetFilter}>
                  {t('Reset')}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {productPermission.create && (
            <Box display={'flex'} gap={2}>
              {/* <ButtonImport />
              <ButtonExport /> */}
              <Box>
                <Link href='/product/data/add'>
                  <Button
                    variant='contained'
                    startIcon={<Icon icon={'tabler:plus'} />}
                    onClick={handleClick}
                  >
                    {t('Product')}
                  </Button>
                </Link>
              </Box>
            </Box>
          )}
        </Box>
        <Box
          mb={4}
          px={4}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        ></Box>
        <TabContext value={tabValue}>
          <TabList onChange={(e, value) => setTabValue(value)}>
            <Tab
              value={''}
              label={
                t('All Status') +
                ` (${
                  productStatusCount &&
                  Object.values(productStatusCount).reduce((a, b) => a + b) > 0
                    ? Object.values(productStatusCount).reduce((a, b) => a + b)
                    : 0
                })`
              }
            />
            <Tab
              value={'live'}
              label={
                t('Published') +
                ` (${
                  productStatusCount && productStatusCount.live > 0 ? productStatusCount.live : 0
                })`
              }
            />
            <Tab
              value={'draft'}
              label={
                t('Unpublished') +
                ` (${
                  productStatusCount && productStatusCount.draft > 0 ? productStatusCount.draft : 0
                })`
              }
            />
            {/* hide archived tab */}
            {/* <Tab
              value={'archived'}
              label={
                t('Archived') +
                ` (${
                  productStatusCount && productStatusCount.archived > 0
                    ? productStatusCount.archived
                    : 0
                })`
              }
            /> */}
          </TabList>
        </TabContext>
        {/* <TableCustom
          data={productData ?? []}
          columns={columns}
          // isLoading={isLoading}
          onRowSelected={onRowSelected}
          onColumnSorting={onColumnSorting}
          pagination={paginationData}
        /> */}
        <TableProduct
          isLoading={isLoading}
          data={productData ?? []}
          pagination={paginationData}
          permission={productPermission}
          onColumnSorting={onColumnSorting}
          itemSelected={itemSelected}
          checkedAll={checkedAll}
          outletData={outletData}
          supplierData={supplierData}
          setItemSelected={setItemSelected}
          setCheckedAll={setCheckedAll}
          refetch={refetch}
        />
      </Card>
      <>
        <PaginationCustom
          itemSelected={itemSelected}
          meta={productMeta}
          onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
          onDeleteButton={() => setDeleteBatch(true)}
          button={
            <>
              {itemSelected.filter(item => item.product.status != 'live').length > 0 && (
                <Button
                  color='success'
                  variant='contained'
                  onClick={() => batchUpdateStatus('live')}
                >
                  {t('Live2')}
                </Button>
              )}
              {itemSelected.filter(item => item.product.status != 'draft').length > 0 && (
                <Button color='info' variant='contained' onClick={() => batchUpdateStatus('draft')}>
                  {t('Draft')}
                </Button>
              )}
            </>
          }
        />
        <DialogConfirmation
          open={deleteProduct}
          handleClose={handleCloseDeleteProduct}
          handleConfirm={handleConfirmDeleteProduct}
          loading={isLoadingDelete}
          name='Product'
        />
        <DialogConfirmation
          open={deleteBatch}
          handleClose={() => setDeleteBatch(false)}
          handleConfirm={handleConfirmDeleteBatch}
          loading={isLoadingDeleteBatch}
          name='Product'
        />
      </>
    </>
  )
})

export default ProductList
