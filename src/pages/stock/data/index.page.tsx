import { GridRenderCellParams } from '@mui/x-data-grid'

import {
  FormControl,
  Button,
  // Checkbox,
  TextField,
  InputAdornment,
  Grid,
  Box,
  Typography,
  Card,
  IconButton
} from '@mui/material'
// import ImagePreview from 'src/components/image/ImagePreview'

// ** React Imports
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import { ElementSize, GridColDef, useGridApiRef } from '@mui/x-data-grid'

// ** Types Imports
// ** Custom Table Components Imports
import { InputLabel as MuiLabel } from '@mui/material'

import { styled } from '@mui/system'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { useQuery } from 'react-query'
import { MetaType } from 'src/types/pagination/meta'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import { useSetAtom } from 'jotai'
import { bottomScrollElAtom, bottomWrapScrollWidthAtom } from 'src/views/pagination/container'
import { useAuth } from 'src/hooks/useAuth'
import { Icon } from '@iconify/react'
import { formatNumber } from 'src/utils/numberUtils'
import DataGridCustom from 'src/components/table/DataGridCustom'
import DialogStockManagement, {
  DataDialogStockManagement
} from './components/DialogStockManagement'
import { formatDate } from 'src/utils/dateUtils'
import { StockDetailWithKey, StockProduct, addKeyToStockDetail } from 'src/types/apps/product/stock'
import { stockService } from 'src/services/product/stock'
import Select, { SelectOption } from 'src/components/form/select/Select'
import { outletService } from 'src/services/outlet/outlet'
import { useTranslation } from 'react-i18next'
import DialogChangeLog from './components/DialogChangeLog'
import { useRouter } from 'next/router'

type SummaryType = {
  trolly: number
  order: number
  complete: number
  stock: number
}

const InputLabel = styled(MuiLabel)(({ theme }) => ({
  background: theme.palette.background.paper
}))

const StockList = () => {
  const { t } = useTranslation()
  const { checkPermission, checkModuleVendor } = useAuth()
  const router = useRouter()

  const [paginationData, setPaginationData] = useState<PageOptionRequestType>({
    ...defaultPagination,
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

  // select product
  // const [selectProduct, setSelectProduct] = useState<VariantResponseType | null>(null)

  const [openDialogChangeLog, setOpenDialogChangeLog] = useState<StockProduct | undefined>(
    undefined
  )
  const closeDialogChangeLog = () => {
    setOpenDialogChangeLog(undefined)
  }

  const [openDialogChangeStock, setOpenDialogChangeStock] = useState<
    DataDialogStockManagement | undefined
  >(undefined)
  const closeDialogChangeStock = () => {
    setOpenDialogChangeStock(undefined)
  }

  const [isLoading, setIsLoading] = useState(true)
  const [stockData, setStockData] = useState<StockDetailWithKey[]>([])
  const [productMeta, setProductMeta] = useState<MetaType>()

  const [summary, setSummary] = useState<SummaryType>({
    trolly: 0,
    order: 0,
    complete: 0,
    stock: 0
  })

  // state filter
  const filterTypeFromQuery = paginationData.sku
    ? 'sku'
    : paginationData.product_name
    ? 'product_name'
    : paginationData.vsku
    ? 'vsku'
    : 'sku'
  const filterTypeValue = filterTypeFromQuery ? paginationData[filterTypeFromQuery] : ''

  const [filterOption, setFilterOption] = useState<string | number | undefined>(filterTypeFromQuery)
  const [filterOptionValue, setFilterOptionValue] = useState<string>(filterTypeValue as string)

  const [outletFilter, setOutletFilter] = useState<string | undefined>()
  const [outletData, setOutletData] = useState<SelectOption[]>([])

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      outlet_id: outletFilter == 'all' ? undefined : outletFilter,
      page: 1
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outletFilter])

  useEffect(() => {
    delete paginationData.sku
    delete paginationData.product_name
    delete paginationData.vsku

    setPaginationData({
      ...paginationData,
      [filterOption as string]: filterOptionValue == '' ? undefined : filterOptionValue,
      page: 1
    })

    if (filterOptionValue == '' || filterOptionValue == undefined) {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOption, filterOptionValue])

  const resetFilter = () => {
    setFilterOption('sku')
    setFilterOptionValue('')
    setOutletFilter('all')
  }

  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      const datas = data.data.data
      if (datas.length > 0) {
        setOutletFilter('all')

        setOutletData([
          { value: 'all', label: `${t('All')} ${t('Outlet')}` },
          ...datas.map(item => ({
            value: item.id.toString(),
            label: item.name
          }))
        ])
      }
    },
    cacheTime: 0
  })

  const { isLoading: isLoadingStockList } = useQuery(['stock-list', paginationData], {
    queryFn: () => stockService.getList(paginationData),
    enabled: checkPermission('data stock.read'),
    onSuccess: data => {
      setIsLoading(false)

      const _data = data.data.data ?? []

      setStockData(addKeyToStockDetail(_data))
      setProductMeta(data.data.meta)

      const trolly = _data.reduce((acc, item) => acc + item.product.total_in_carts, 0)
      const order = _data.reduce(
        (acc, item) =>
          acc +
          item.product.total_in_order_unpaid +
          item.product.total_in_order_on_process +
          item.product.total_in_order_on_delivery,
        0
      )

      const complete = _data.reduce((acc, item) => acc + item.product.total_in_order_completed, 0)
      const stock = _data.reduce((acc, item) => acc + item.product.stock, 0)

      setSummary({
        trolly,
        order,
        complete,
        stock
      })
    },
    onError: () => {
      setIsLoading(false)
    },
    cacheTime: 0
  })

  useEffect(() => {
    if (isLoadingStockList) {
      setIsLoading(true)
    }
  }, [isLoadingStockList])

  const [
    itemSelected
    // setItemSelected
  ] = useState<StockDetailWithKey[]>([])
  // const [checkedAll, setCheckedAll] = useState(false)
  // const isCheckboxIndeterminate = () => getHasChecked() && !checkedAll

  // const handleChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   id: string,
  //   stock?: StockDetailWithKey
  // ) => {
  //   if (id !== 'all') {
  //     if (stock && event.target.checked) setItemSelected([...itemSelected, stock])
  //     else if (stock && !event.target.checked)
  //       setItemSelected(itemSelected.filter(item => item.product.id != stock.product.id))

  //     setCheckedAll(false)
  //   } else {
  //     if (!isCheckboxIndeterminate()) {
  //       setCheckedAll(event.target.checked)
  //       if (event.target.checked) setItemSelected(stockData)
  //       else if (!event.target.checked) setItemSelected([])
  //     } else {
  //       setItemSelected([])
  //     }
  //   }
  // }

  // const getHasChecked = () => {SSS
  //   return itemSelected.length > 0
  // }

  const columnsSummary: GridColDef<SummaryType>[] = [
    {
      width: 22,
      headerName: '',
      field: 'number'
    },
    {
      flex: 2,
      field: 'name',
      headerName: ''
    },
    {
      flex: 1,
      field: 'attributes',
      headerName: ''
    },
    {
      flex: 0.8,
      field: 'vsku',
      headerName: ''
    },
    {
      flex: 1,
      field: 'category_name',
      headerName: ''
    },
    // {
    //   flex: 1,
    //   field: 'trolley',
    //   headerName: formatNumber(summary.trolly)
    // },
    // {
    //   flex: 1,
    //   field: 'order',
    //   headerName: formatNumber(summary.order)
    // },
    // {
    //   flex: 1,
    //   field: 'finish',
    //   headerName: formatNumber(summary.complete)
    // },
    {
      flex: 0.8,
      field: 'stock',
      headerName: formatNumber(summary.stock)
    },
    {
      flex: 1,
      field: 'updated_at',
      headerName: ''
    },
    ...(outletData.length > 2
      ? [
          {
            disableColumnMenu: true,
            sortable: false,
            flex: 1,
            field: 'outlet',
            headerName: ''
          } as GridColDef<SummaryType>
        ]
      : []),
    {
      cellClassName: 'column-action',
      width: 100,
      field: 'action',
      headerName: ''
    }
  ]

  const columns: GridColDef<StockDetailWithKey>[] = [
    // {
    //   cellClassName: 'padding-left-01rem',
    //   headerClassName: 'padding-left-01rem',
    //   width: 0,
    //   disableColumnMenu: true,
    //   sortable: false,
    //   headerName: 'Checkbox',
    //   field: 'checkbox',
    //   renderCell: index => {
    //     return (
    //       <Checkbox
    //         sx={{
    //           paddingTop: 0,
    //           paddingBottom: 0
    //         }}
    //         checked={itemSelected.includes(index.row) || false}
    //         // onChange={e => handleChange(e, index.row.product.id, index.row as ProductDetailType)}
    //         // key={index.row.product.id}
    //       />
    //     )
    //   },
    //   renderHeader: () => (
    //     <Checkbox
    //       indeterminate={isCheckboxIndeterminate()}
    //       checked={checkedAll}
    //       onChange={e => handleChange(e, 'all')}
    //     />
    //   )
    // },
    {
      width: 22,
      headerName: t('No') ?? 'No',
      disableColumnMenu: true,
      sortable: false,
      field: 'number',
      renderCell: (index: GridRenderCellParams) => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.key) ?? 1) +
          1 +
          (paginationData?.limit ?? 50) * ((paginationData?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 2,
      field: 'name',
      headerName: t('Product') ?? 'Product',
      renderCell: index => {
        const product = index.row.product

        if (!product) return <Typography variant='body2'>-</Typography>

        return (
          <Box sx={{ display: 'flex', alignItems: 'start' }}>
            {/* <ImagePreview
              avatar={product.media && product.media.length > 0 ? product.media[0] : ''}
              fullName={product.name}
              // badge={product.labels}
              // discount={product.discount}
              // discountType={product.discount_type}
            /> */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
                title={product.name}
              >
                {product.name}
              </Typography>
              <Typography variant='caption' color={'secondary'}>
                MSKU: {product.sku}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 1,
      field: 'attributes',
      headerName: t('Variation') ?? 'Variation',
      renderCell: params =>
        params.row.product.attributes?.map(attribute => attribute.value).join(' - ') ?? '-'
    },
    {
      flex: 0.8,
      field: 'vsku',
      headerName: t('VSKU') ?? 'VSKU',
      renderCell: params => params.row.product.vsku ?? '-'
    },
    {
      flex: 1,
      field: 'category_name',
      headerName: t('Category') ?? 'Category',
      renderCell: index => {
        return index.row.product?.category_name ?? '-'
      }
    },
    // {
    //   flex: 1,
    //   sortable: false,
    //   field: 'trolley',
    //   headerName: t('Trolley') ?? 'Trolley',
    //   renderCell: index => formatNumber(index.row.product.total_in_carts)
    // },
    // {
    //   flex: 1,
    //   sortable: false,
    //   field: 'order',
    //   headerName: t('Order') ?? 'Order',
    //   renderCell: index =>
    //     formatNumber(
    //       index.row.product.total_in_order_unpaid +
    //         index.row.product.total_in_order_on_process +
    //         index.row.product.total_in_order_on_delivery
    //     )
    // },
    // {
    //   flex: 1,
    //   sortable: false,
    //   field: 'finish',
    //   headerName: t('Finish') ?? 'Finish',
    //   renderCell: index => formatNumber(index.row.product.total_in_order_completed)
    // },
    {
      flex: 0.8,
      field: 'stock',
      headerName: t('Stock') ?? 'Stock',
      renderCell: index =>
        index.row.product && (
          <Typography
            variant='body2'
            {...(checkPermission('data stock.update')
              ? {
                  className: 'hover-underline',
                  sx: { color: 'primary.main' },
                  onClick: () =>
                    setOpenDialogChangeStock({
                      stock: index.row
                    })
                }
              : {})}
          >
            {formatNumber(index.row.product.stock)}
            {checkPermission('data stock.update') && (
              <IconButton
                size='small'
                onClick={() =>
                  setOpenDialogChangeStock({
                    stock: index.row
                  })
                }
              >
                <Icon icon='iconamoon:edit-light' fontSize={12} />
              </IconButton>
            )}
          </Typography>
        )
    },
    {
      flex: 1,
      field: 'updated_at',
      headerName: t('Last Update') ?? 'Last Update',
      renderCell: params => formatDate(params.row.product.updated_at)
    },
    ...(outletData.length > 2
      ? [
          {
            flex: 1,
            field: 'outlet',
            headerName: t('Outlet') ?? 'Outlet',
            renderCell: index => {
              return (index.row.outlets ?? []).length > 2
                ? index.row.outlets
                    .slice(0, 2)
                    .map(outlet => outlet.outlet.name)
                    .join(', ') +
                    ' + ' +
                    (index.row.outlets.length - 2) +
                    ' outlet lainnya'
                : (index.row.outlets ?? []).map(outlet => outlet.outlet.name).join(', ') ?? '-'
            }
          } as GridColDef<StockDetailWithKey>
        ]
      : []),
    {
      cellClassName: 'column-action',
      width: 100,
      sortable: false,
      field: 'action',
      headerName: t('Action') ?? 'Action',
      renderCell: params => {
        return (
          <Grid container justifyContent={'right'}>
            <Grid item>
              {/* <Link
                href={
                  params.row.product.is_variant && params.row.product.vsku != ''
                    ? `/stock/history/?product_variant_id=${params.row.product.product_variant_id}`
                    : `/stock/history/?sku=${params.row.product.sku}`
                }
              > */}
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setOpenDialogChangeLog(params.row.product)
                }}
              >
                Detail
              </Button>
              {/* </Link> */}
            </Grid>
          </Grid>
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
      const el = dataGridRef.current.getElementsByClassName('MuiDataGrid-columnHeadersInner')
      if (el.length > 0) setBottomScrollEl(el[0])
    }
  }

  return (
    <Grid
      container
      spacing={6.5}
      sx={{
        mb: '50px'
      }}
    >
      <Grid item xs={12}>
        <Card>
          <Box
            sx={{
              py: 4,
              px: 4,
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
              <FormControl size='small'>
                <Select
                  placeholder='MSKU'
                  defaultValue={'sku'}
                  value={filterOption}
                  sx={{
                    minWidth: 100
                  }}
                  options={[
                    { value: 'sku', label: 'MSKU' },
                    { value: 'vsku', label: 'VSKU' },
                    {
                      value: 'product_name',
                      label: `${t('Product Name')}`
                    }
                  ]}
                  onChange={e => {
                    setFilterOption((e.target.value as string) ?? 'sku')
                  }}
                />
              </FormControl>
              <TextField
                value={filterOptionValue}
                type='search'
                variant='outlined'
                className='text-input-group'
                placeholder={(t('Search') ?? 'Search') + '...'}
                size='small'
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position='end'
                      sx={{
                        cursor: 'pointer'
                      }}
                    >
                      <Icon fontSize='1.125rem' icon='tabler:search' />
                    </InputAdornment>
                  )
                }}
                onChange={e => {
                  const value = e.target.value as string

                  setFilterOptionValue(value)
                }}
              />
              {/* <InputGroupComponent>
                <FormControl size='small'>
                  <Select
                    placeholder='MSKU'
                    className='select-input-group'
                    id='demo-simple-select-outlined'
                    defaultValue={'MSKU'}
                  >
                    <MenuItem value={'MSKU'}>MSKU</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  type='search'
                  variant='outlined'
                  className='text-input-group'
                  placeholder='Search'
                  size='small'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position='end'
                        sx={{
                          cursor: 'pointer'
                        }}
                      >
                        <Icon fontSize='1.125rem' icon='tabler:search' />
                      </InputAdornment>
                    )
                  }}
                />
              </InputGroupComponent> */}
            </Box>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              {!getOutlet.isLoading && outletData.length > 2 && (
                <Select
                  fullWidth
                  sx={{ minWidth: 160 }}
                  options={outletData}
                  value={outletFilter}
                  onChange={e => {
                    setOutletFilter((e?.target?.value as string) ?? 'all')
                  }}
                  label='Outlet'
                />
              )}
              <FormControl
                size='small'
                sx={{
                  maxWidth: 100
                }}
              >
                <InputLabel id='select-status'>Sort By</InputLabel>
                {/* <Select label='Status' id='select-status' onChange={handleRoleChange}>
                  <MenuItem value='admin'>Value 1</MenuItem>
                </Select> */}
              </FormControl>
              <Button color='primary' variant='outlined' onClick={resetFilter}>
                Reset
              </Button>
            </Box>
          </Box>
          {/* <Divider sx={{ m: '0 !important' }} /> */}
          {/* <Box
            sx={{
              py: 4,
              px: 4,
              rowGap: 2,
              columnGap: 4,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box />
            <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button color='primary' variant='contained' startIcon={<Icon icon='tabler:upload' />}>
                Import/Export
              </Button>
            </Box>
          </Box> */}
          <DataGridCustom
            autoHeight
            sx={{
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                display: 'none'
              },
              '& .MuiDataGrid-cell': {
                alignItems: 'start',
                paddingY: 2
              }
            }}
            getRowHeight={() => 'auto'}
            getRowId={row => row.key}
            ref={dataGridRef}
            apiRef={gridRef}
            onResize={onResize}
            loading={isLoading}
            rows={stockData ?? []}
            // rows={manipulateRows(productData)}
            columns={columns}
            disableColumnMenu
            hideFooter
            setPaginationData={setPaginationData}
            // hide column
            columnVisibilityModel={{
              vsku: checkModuleVendor('stock-table-column-vsku') ? true : false,
              trolley: checkModuleVendor('stock-table-column-status-order') ? true : false,
              order: checkModuleVendor('stock-table-column-status-order') ? true : false,
              finish: checkModuleVendor('stock-table-column-status-order') ? true : false
            }}
          />
          <DataGridCustom
            sx={{
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              }
            }}
            rowHeight={0}
            autoHeight
            rows={[]}
            columns={columnsSummary}
            disableColumnMenu
            disableRowSelectionOnClick
            hideFooter
          />
        </Card>
        <PaginationCustom
          itemSelected={itemSelected}
          meta={productMeta}
          onChangePagination={(page, limit) => setPaginationData(old => ({ ...old, page, limit }))}
        />
        <DialogStockManagement
          data={openDialogChangeStock}
          onClose={() => closeDialogChangeStock()}
        />
        <DialogChangeLog
          onClose={() => closeDialogChangeLog()}
          product={openDialogChangeLog}
          open={openDialogChangeLog != undefined}
          product_variant_id={openDialogChangeLog && openDialogChangeLog.product_variant_id}
          sku={openDialogChangeLog && openDialogChangeLog.sku}
        />
      </Grid>
    </Grid>
  )
}

export default StockList
