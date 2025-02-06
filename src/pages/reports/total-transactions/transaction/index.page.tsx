import { Box, Button, Card, Divider, Grid, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import SelectCustom from 'src/components/form/select/SelectCustom'
import DataGridCustom from 'src/components/table/DataGridCustom'
import { categoryService } from 'src/services/category'
import { customerService } from 'src/services/customer'
import { dashboardService } from 'src/services/dashboard/dashboard'
import { orderService } from 'src/services/order'
import { outletService } from 'src/services/outlet/outlet'
import { productService } from 'src/services/product'
import { CategoriesDetailType } from 'src/types/apps/categoryType'
import { CustomerType } from 'src/types/apps/customerType'
import { OrderFullDetailType } from 'src/types/apps/order'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { ProductDetailType } from 'src/types/apps/productType'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { MetaType } from 'src/types/pagination/meta'
import {
  PageOptionRequestType,
  defaultPagination,
  maxLimitPagination
} from 'src/types/pagination/pagination'
import { parseRangeDateValueStr, rangeDateValue } from 'src/utils/apiUtils'
import { formatDate, periodeDateString } from 'src/utils/dateUtils'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import PaginationCustom from 'src/views/components/pagination/PaginationCustom'
import CardSummary from '../../components/CardSummary'

const today = new Date()
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

type summaryType = {
  qty: number
  total: number
  discount: number
  tax: number
  shipping_cost: number
  grand_total: number
}

const ReportsOrderPage = () => {
  const { t } = useTranslation()

  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(defaultStartDate)
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(defaultEndDate)

  // Order Data
  const [orders, setOrders] = useState<OrderFullDetailType[]>([])
  const [orderMeta, setOrderMeta] = useState<MetaType>()
  const [paginationDataOrders, setPaginationDataOrders] =
    useState<PageOptionRequestType>(defaultPagination)

  const [grandTotal, setGrandTotal] = useState<number>(0)
  const [grandQty, setQty] = useState<number>(0)

  const [summary, setSummary] = useState<summaryType>({
    qty: 0,
    total: 0,
    discount: 0,
    tax: 0,
    shipping_cost: 0,
    grand_total: 0
  })

  useQuery(
    ['dashboardSummaryChart', paginationDataOrders.created_at],
    () =>
      dashboardService.getChart(
        parseRangeDateValueStr((paginationDataOrders.created_at as string) || undefined, true)
      ),
    {
      onSuccess: data => {
        setQty(data.data.data.reduce((acc, curr) => acc + curr.total_product_sold, 0))
        setGrandTotal(data.data.data.reduce((acc, curr) => acc + curr.total_sales, 0))
      },
      enabled: startDateRange && endDateRange ? true : false
    }
  )

  const ordersQuery = useQuery(['list-orders', paginationDataOrders], {
    queryFn: () => orderService.getList(paginationDataOrders),
    onSuccess: data => {
      const _orders = data.data.data ?? []

      setOrders(_orders)
      setOrderMeta(data.data.meta)

      // Summary
      const _summary = _orders.reduce(
        (acc, curr) => {
          acc.qty += curr.order.item_qty
          acc.total += curr.order.total
          acc.discount += curr.order.discount
          acc.tax += curr.order.tax + (curr.order.shipping_tax ?? 0)
          acc.shipping_cost += curr.order.shipping_cost ?? 0
          acc.grand_total += curr.order.grand_total

          return acc
        },
        {
          qty: 0,
          total: 0,
          discount: 0,
          tax: 0,
          shipping_cost: 0,
          grand_total: 0
        }
      )

      setSummary(_summary)
    }
  })

  // Filter Outlet
  const [filterOutletVal, setFilterOutletVal] = useState<string>('')
  const [outlets, setOutlets] = useState<OutletType[]>([])

  useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutlets(data.data.data ?? [])
    }
  })

  // Filter Product
  const [product, setProduct] = useState<ProductDetailType>()
  const [products, setProducts] = useState<ProductDetailType[]>([])

  const defaultPaginationProduct = defaultPagination
  defaultPaginationProduct.sort = 'desc'

  const [paginationDataProduct, setPaginationDataProduct] =
    useState<PageOptionRequestType>(defaultPaginationProduct)

  const onHandleSearch = (value: string) => {
    setPaginationDataProduct({ ...paginationDataProduct, query: value, page: 1 })
  }

  useQuery(['list-product', paginationDataProduct], {
    queryFn: () => productService.getListProductDetail(paginationDataProduct),
    onSuccess: data => {
      setProducts(data.data.data ?? [])
    }
  })

  // Filter Category
  const [filterCategoryVal, setFilterCategoryVal] = useState<string>('')
  const [categories, setCategories] = useState<CategoriesDetailType[]>([])

  useQuery('category-list', {
    queryFn: () => categoryService.getListCategoriesDetail(maxLimitPagination),
    onSuccess: data => {
      setCategories(data.data.data ?? [])
    }
  })

  // Filter Customer
  const [filterCustomerVal, setFilterCustomerVal] = useState<string>('')
  const [customers, setCustomers] = useState<CustomerType[]>([])
  useQuery('customer-list', {
    queryFn: () => customerService.getListCustomer(maxLimitPagination),
    onSuccess: data => {
      setCustomers(data.data.data ?? [])
    }
  })

  // Filter Order Status
  const [filterOrderStatusVal, setFilterOrderStatusVal] = useState<string>('all')

  useEffect(() => {
    delete paginationDataProduct.outlet_id

    // change pagination product if outlet change
    setProducts([])
    setProduct(undefined)
    setPaginationDataProduct({
      ...paginationDataProduct,
      outlet_id: filterOutletVal == '' ? undefined : filterOutletVal
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOutletVal])

  // useEffect Filters
  useEffect(() => {
    delete paginationDataOrders.created_at
    delete paginationDataOrders.product_name
    delete paginationDataOrders.outlet_id
    delete paginationDataOrders.category_id
    delete paginationDataOrders.customer_id
    delete paginationDataOrders.order_status

    setPaginationDataOrders({
      ...paginationDataOrders,
      page: 1,
      created_at: rangeDateValue(
        startDateRange ?? defaultStartDate,
        endDateRange ?? defaultEndDate
      ),
      product_name: product?.product.name ?? undefined,
      outlet_id: filterOutletVal == '' ? undefined : filterOutletVal,
      category_id: filterCategoryVal == '' ? undefined : filterCategoryVal,
      customer_id: filterCustomerVal == '' ? undefined : filterCustomerVal,
      order_status: filterOrderStatusVal === 'all' ? undefined : filterOrderStatusVal
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startDateRange,
    endDateRange,
    filterOutletVal,
    product,
    filterCategoryVal,
    filterCustomerVal,
    filterOrderStatusVal
  ])

  // Reset Filter
  const resetFilter = () => {
    setStartDateRange(defaultStartDate)
    setEndDateRange(defaultEndDate)
    setFilterOutletVal('')
    setProduct(undefined)
    setFilterCategoryVal('')
    setFilterCustomerVal('')
    setFilterOrderStatusVal('all')
  }

  const columnsSummary: GridColDef<summaryType>[] = [
    {
      sortable: false,
      width: 22,
      field: 'no',
      headerName: ''
    },
    {
      sortable: false,
      flex: 1,
      field: 'order_number',
      headerName: ''
    },
    {
      sortable: false,
      flex: 1,
      field: 'date',
      headerName: ''
    },
    {
      sortable: false,
      flex: 1,
      field: 'customer_name',
      headerName: ''
    },
    {
      sortable: false,
      flex: 1,
      field: 'order_status',
      headerName: ''
    },
    {
      sortable: false,
      width: 80,
      field: 'qty',
      headerName: formatNumber(summary.qty)
    },

    {
      sortable: false,
      flex: 1,
      field: 'total',
      headerName: formatPriceIDR(summary.total)
    },
    {
      sortable: false,
      flex: 1,
      field: 'discount',
      headerName: formatPriceIDR(summary.discount)
    },
    {
      sortable: false,
      flex: 1,
      field: 'tax',
      headerName: formatPriceIDR(summary.tax)
    },
    {
      sortable: false,
      flex: 1,
      field: 'shipping_cost',
      headerName: formatPriceIDR(summary.shipping_cost)
    },
    {
      sortable: false,
      flex: 1,
      field: 'grand_total',
      headerName: formatPriceIDR(summary.grand_total)
    }
  ]

  const columns: GridColDef<OrderFullDetailType>[] = [
    {
      width: 22,
      field: 'no',
      headerName: t('No') ?? 'No',
      sortable: false,
      renderCell: index => {
        return (
          (index.api.getRowIndexRelativeToVisibleRows(index.row.order.id) ?? 1) +
          1 +
          (paginationDataOrders?.limit ?? 50) * ((paginationDataOrders?.page ?? 1) - 1)
        )
      }
    },
    {
      flex: 1,
      field: 'order_number',
      headerName: 'Order ID',
      renderCell: ({ row }) => (
        <Link
          href={'/order/detail/' + row.order.id}
          target='_blank'
          className='hover-underline'
          style={{
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          <Typography variant='body2' fontWeight={'medium'} color={'primary'}>
            {row.order.order_number}
          </Typography>
        </Link>
      )
    },
    {
      flex: 1,
      field: 'date',
      headerName: t('Date') ?? 'Date',
      sortable: false,
      renderCell: ({ row }) => formatDate(row.order.created_at)
    },
    {
      flex: 1,
      field: 'customer_name',
      headerName: t('Customer') ?? 'Customer',
      renderCell: ({ row }) => row.order.customer.name
    },
    {
      flex: 1,
      field: 'order_status',
      headerName: t('Status') ?? 'Status',
      renderCell: ({ row }) => t(row.order.order_status) ?? row.order.order_status
    },
    {
      width: 80,
      field: 'qty',
      headerName: t('Qty') ?? 'Qty',
      renderCell: ({ row }) => formatNumber(row.order.item_qty)
    },

    {
      flex: 1,
      field: 'total',
      headerName: t('Total') ?? 'Total',
      renderCell: ({ row }) => formatPriceIDR(row.order.total)
    },
    {
      flex: 1,
      field: 'discount',
      headerName: t('Discount') ?? 'Discount',
      renderCell: ({ row }) => formatPriceIDR(row.order.discount)
    },
    {
      flex: 1,
      field: 'tax',
      headerName: t('Tax') ?? 'Tax',
      renderCell: ({ row }) => formatPriceIDR(row.order.tax + (row.order.shipping_tax ?? 0))
    },
    {
      flex: 1,
      field: 'shipping_cost',
      headerName: t('Shipping Fee') ?? 'Shipping Fee',
      renderCell: ({ row }) => formatPriceIDR(row.order.shipping_cost ?? 0)
    },
    {
      flex: 1,
      field: 'grand_total',
      headerName: t('Grand Total') ?? 'Grand Total',
      renderCell: ({ row }) => formatPriceIDR(row.order.grand_total)
    }
  ]

  return (
    <div>
      <Card
        sx={{
          marginBottom: 14
        }}
      >
        <Box margin={4}>
          <Box textAlign={'center'} mb={5}>
            <Typography variant='h3'>{t('Laporan Total Pesanan')}</Typography>
            <Typography variant='subtitle2'>
              Periode:{' '}
              {periodeDateString(
                startDateRange ?? defaultStartDate,
                endDateRange ?? defaultEndDate
              )}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <PickersRangeMonth
              startDate={startDateRange}
              endDate={endDateRange}
              defaultStartDate={defaultStartDate}
              defaultEndDate={defaultEndDate}
              onChangeDateRange={(start, end) => {
                if (start && end) {
                  setStartDateRange(start)
                  setEndDateRange(end)
                }

                if (start == null && end == null) {
                  setStartDateRange(defaultStartDate)
                  setEndDateRange(defaultEndDate)
                }
              }}
            />
            {outlets.length > 1 && (
              <Box width={150}>
                <SelectCustom
                  isFloating
                  value={filterOutletVal}
                  onSelect={outlet => {
                    setFilterOutletVal(outlet?.id ?? null)
                  }}
                  optionKey={'id'}
                  labelKey={'name'}
                  label={t('Outlet') ?? 'Outlet'}
                  options={outlets ?? []}
                  {...(outlets.length == 1 && {
                    defaultValueId: outlets[0]
                  })}
                />
              </Box>
            )}
            <Box width={150}>
              <SelectCustom
                isFloating
                serverSide
                minWidthPaper={500}
                optionKey={['product', 'id']}
                labelKey={['product', 'name']}
                options={products ?? []}
                onInputChange={(_, value) => {
                  onHandleSearch(value)

                  if (value == '') {
                    setProduct(undefined)
                  }
                }}
                label={t('Product') ?? 'Product'}
                onSelect={value => {
                  setProduct(value)
                }}
                value={product?.product.id ?? ''}
                onAddButton={() => {
                  window.open('/product/data/add', '_blank')
                }}
                onShowButton={() => {
                  window.open('/product', '_blank')
                }}
              />
            </Box>
            {/* {categories.length > 1 && (
              <Box width={150}>
                <SelectCustom
                  isFloating
                  value={filterCategoryVal}
                  onSelect={category => {
                    setFilterCategoryVal(category?.category?.id ?? null)
                  }}
                  optionKey={['category', 'id']}
                  labelKey={['category', 'name']}
                  label={t('Category') ?? 'Category'}
                  options={categories ?? []}
                  {...(categories.length == 1 && {
                    defaultValueId: categories[0]
                  })}
                />
              </Box>
            )} */}
            {customers.length > 1 && (
              <Box width={150}>
                <SelectCustom
                  isFloating
                  value={filterCustomerVal}
                  onSelect={customer => {
                    setFilterCustomerVal(customer?.id ?? null)
                  }}
                  optionKey={'id'}
                  labelKey={'name'}
                  label={t('Customer') ?? 'Customer'}
                  options={customers ?? []}
                  {...(categories.length == 1 && {
                    defaultValueId: categories[0]
                  })}
                />
              </Box>
            )}
            <Box width={150}>
              <SelectCustom
                isFloating
                label={t('Status') ?? 'Status'}
                options={[
                  { value: 'all', name: t('All') },
                  { value: 'UNPAID,ON PROCESS,ON DELIVERY', name: 'Sedang Berjalan' },
                  { value: 'COMPLETED', name: 'Selesai' },
                  { value: 'CANCELED', name: 'Batal' }
                ]}
                optionKey={'value'}
                labelKey={'name'}
                value={filterOrderStatusVal}
                onSelect={data => {
                  setFilterOrderStatusVal(data?.value ?? 'all')
                }}
              />
            </Box>
            <Box width={150}>
              <Button variant='contained' color='primary' onClick={resetFilter}>
                Reset
              </Button>
            </Box>
            {/* <Box display={'flex'} alignItems={'right'} gap={2}>
              <Button variant='contained' color='success'>
                Excel
              </Button>
              <Button variant='contained' color='error'>
                PDF
              </Button>
            </Box> */}
          </Box>

          <Divider
            sx={{
              marginTop: 4
            }}
          />

          <Grid container mt={4} spacing={2}>
            <Grid item xs={6} md={4} lg={2}>
              <CardSummary
                title={t('Quantity') + ' (' + t('COMPLETED') + ')'}
                value={formatNumber(grandQty)}
                color={'primary.main'}
              />
            </Grid>
            <Grid item xs={6} md={4} lg={2}>
              <CardSummary
                title={t('Total') + ' (' + t('COMPLETED') + ')'}
                value={formatPriceIDR(grandTotal)}
                color={'success.main'}
              />
            </Grid>
          </Grid>
        </Box>
        <DataGridCustom
          loading={ordersQuery.isLoading}
          getRowId={row => row.order.id}
          autoHeight
          rows={orders}
          columns={columns}
          disableColumnMenu
          disableRowSelectionOnClick
          hideFooter
          setPaginationData={setPaginationDataOrders}
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
        <PaginationCustom
          itemSelected={[]}
          meta={orderMeta}
          onChangePagination={(page, limit) =>
            setPaginationDataOrders(old => ({ ...old, page, limit }))
          }
        />
      </Card>
    </div>
  )
}

export default ReportsOrderPage
