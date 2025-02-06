// ** MUI Import
import Grid from '@mui/material/Grid'

// ** Custom Component Import
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { Box, Button, Card, CardContent, CircularProgress } from '@mui/material'
import CardStatsVertical from './components/CardStatsVertical'
import { rangeDateValue } from 'src/utils/apiUtils'
import PickersRangeMonth from 'src/components/form/datepicker/PickersRangeMonth'
import { addDays, differenceInDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import CardChartDashboard from './components/CardChartDashboard'
import { useTranslation } from 'react-i18next'
import CardTopProduct from './components/CardTopProduct'
import CardTopCustomer from './components/CardTopCustomer'
import CardTopCategory from './components/CardTopCategory'
import {
  DashboardSummary,
  DashboardSummaryChart,
  DashboardTopCategory,
  DashboardTopCustomer,
  DashboardTopProduct
} from 'src/types/apps/dashboard/dashboard'
import { useQuery } from 'react-query'
import { dashboardService } from 'src/services/dashboard/dashboard'
import { formatDateFilter } from 'src/utils/dateUtils'
import { reportProductSalesService } from 'src/services/report/product-sales'
import useAppBarButton from 'src/hooks/useAppBarButton'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import { useAuth } from 'src/hooks/useAuth'
import CardChartDashboardDailyNew from './components/CardChartDashboardDailyNew'
import SelectCustom from 'src/components/form/select/SelectCustom'

const today = new Date()
const yesterday = addDays(today, -1)
const startWeek = addDays(today, -today.getDay())
const endWeek = addDays(startWeek, 6)
const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const AnalyticsDashboard = () => {
  // useAppBarButton
  const { checkPermission } = useAuth()
  const { setButtonLeft } = useAppBarButton()

  const { t } = useTranslation()

  const defaultStartDate = today
  const defaultEndDate = today

  const [quickDate, setQuickDate] = useState('today')
  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(defaultStartDate)
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(defaultEndDate)

  const [dataSummary, setDataSummary] = useState<DashboardSummary>()
  const [dataSummaryChart, setDataSummaryChart] = useState<DashboardSummaryChart[]>()
  const [dataTopProduct, setDataTopProduct] = useState<DashboardTopProduct[]>()
  const [dataTopCategory, setDataTopCategory] = useState<DashboardTopCategory[]>()
  const [dataTopCustomer, setDataTopCustomer] = useState<DashboardTopCustomer[]>()

  // Filter Outlet
  const [filterOutletVal, setFilterOutletVal] = useState<string>('')
  const outletSelectedArr = filterOutletVal
    ? filterOutletVal.split(',').map(item => parseInt(item))
    : []

  // Filter Order Status
  const [filterOrderStatusVal, setFilterOrderStatusVal] = useState<string>('COMPLETED')

  // useQuery

  useQuery(['dashboardSummary', filterOutletVal], {
    queryFn: () => dashboardService.getSummary({ outlet_ids: filterOutletVal }),
    onSuccess: data => {
      setDataSummary(data.data.data)
    },
    enabled: checkPermission('dashboard.read')
  })

  useQuery(
    ['dashboardSummaryChart', startDateRange, endDateRange, filterOutletVal, filterOrderStatusVal],
    () =>
      dashboardService.getChart({
        start_date: formatDateFilter(startDateRange ?? defaultStartDate),
        end_date: formatDateFilter(endDateRange ?? defaultEndDate),
        outlet_ids: filterOutletVal,
        order_status: filterOrderStatusVal
      }),
    {
      onSuccess: data => {
        setDataSummaryChart(data.data.data)
      },
      enabled: (startDateRange && endDateRange ? true : false) && checkPermission('dashboard.read')
    }
  )

  useQuery(['dashboardTopProduct', startDateRange, endDateRange, filterOutletVal], {
    queryFn: () =>
      reportProductSalesService.getList({
        limit: 5,
        page: 1,
        order: 'product_sold_quantity',
        sort: 'desc',
        created_at: rangeDateValue(
          startDateRange ?? defaultStartDate,
          endDateRange ?? defaultEndDate
        ),
        outlet_ids: filterOutletVal
      }),
    onSuccess: data => {
      const _data = data.data.data?.product_sale_item || []
      setDataTopProduct(
        _data.map(item => ({
          name: item.name,
          quantity_sold: item.product_sold_quantity,
          total_sales: item.product_sold_amount
        }))
      )
    },
    enabled: checkPermission('dashboard.read')
  })

  useQuery(['dashboardTopCategory', startDateRange, endDateRange, filterOutletVal], {
    queryFn: () =>
      reportProductSalesService.getSalesPerCategory({
        limit: 5,
        page: 1,
        order: 'total_product_sold',
        sort: 'desc',
        created_at: rangeDateValue(
          startDateRange ?? defaultStartDate,
          endDateRange ?? defaultEndDate
        ),
        outlet_ids: filterOutletVal
      }),
    onSuccess: data => {
      const _data = data.data.data?.category_sale_item || []
      setDataTopCategory(
        _data.map(item => ({
          name: item.category_name,
          quantity_sold: item.total_product_sold,
          total_sales: item.total_sales
        }))
      )
    },
    enabled: checkPermission('dashboard.read')
  })

  useQuery(['dashboardTopCustomer', startDateRange, endDateRange, filterOutletVal], {
    queryFn: () =>
      reportProductSalesService.getSalesPerCustomer({
        limit: 5,
        page: 1,
        order: 'total_product_sold',
        sort: 'desc',
        created_at: rangeDateValue(
          startDateRange ?? defaultStartDate,
          endDateRange ?? defaultEndDate
        ),
        outlet_ids: filterOutletVal
      }),

    onSuccess: data => {
      const _data = data.data.data?.customer_sale_item || []
      setDataTopCustomer(
        _data.map(item => ({
          name: item.customer_name,
          quantity_sold: item.total_product_sold,
          total_sales: item.total_sales
        }))
      )
    },
    enabled: checkPermission('dashboard.read')
  })

  useEffect(() => {
    if (startDateRange && endDateRange) {
      if (startDateRange === endDateRange && startDateRange === today) {
        setQuickDate('today')
      } else if (startDateRange === endDateRange && startDateRange === yesterday) {
        setQuickDate('yesterday')
      } else if (startDateRange === startWeek && endDateRange === endWeek) {
        setQuickDate('thisWeek')
      } else if (startDateRange === startMonth && endDateRange === endMonth) {
        setQuickDate('thisMonth')
      } else {
        setQuickDate('')
      }
    }
  }, [startDateRange, endDateRange])

  const handleToday = () => {
    setStartDateRange(today)
    setEndDateRange(today)
  }

  const handleYesterday = () => {
    setStartDateRange(yesterday)
    setEndDateRange(yesterday)
  }

  const handleThisWeek = () => {
    setStartDateRange(startWeek)
    setEndDateRange(endWeek)
  }

  const handleThisMonth = () => {
    setStartDateRange(startMonth)
    setEndDateRange(endMonth)
  }

  useEffect(() => {
    setButtonLeft(
      <>
        <FilterOutlet
          multiple
          value={outletSelectedArr}
          onChange={value => setFilterOutletVal(value?.join(',') ?? '')}
        />
      </>
    )

    return () => {
      setButtonLeft(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setButtonLeft, filterOutletVal])

  if (checkPermission('dashboard.read') === false) {
    setButtonLeft(undefined)

    return null
  }

  return (
    <ApexChartWrapper>
      <KeenSliderWrapper>
        <Grid container spacing={2} mb={8}>
          {dataSummary && (
            <>
              <Grid item xs={4} lg={3}>
                <CardStatsVertical
                  total={dataSummary.total_products}
                  chipText={
                    dataSummary.new_products > 0
                      ? `+${dataSummary.new_products} ${t('New product')}`
                      : t('No new product')
                  }
                  avatarColor='info'
                  chipColor='default'
                  title={`Total ${t('Product')}`}
                  avatarIcon='tabler:album'
                  linkCard='/product/data'
                  linkChip={'/product/data?created_at=' + formatDateFilter(today)}
                />
              </Grid>
              <Grid item xs={4} lg={3}>
                <CardStatsVertical
                  total={dataSummary.total_orders}
                  chipText={
                    dataSummary.new_orders > 0
                      ? `+${dataSummary.new_orders} ${t('New order')}`
                      : t('No new order')
                  }
                  avatarColor='warning'
                  chipColor='default'
                  title={`Total ${t('Order')}`}
                  avatarIcon='tabler:brand-appgallery'
                  linkCard='/order'
                  linkChip={
                    '/order?order_status=COMPLETED&created_at=' +
                    rangeDateValue(new Date(), new Date())
                  }
                />
              </Grid>
              <Grid item xs={4} lg={3}>
                <CardStatsVertical
                  total={dataSummary.total_customers}
                  chipText={
                    dataSummary.new_customers > 0
                      ? `+${dataSummary.new_customers} ${t('New customer')}`
                      : t('No new customer')
                  }
                  avatarColor='success'
                  chipColor='default'
                  title={`Total ${t('Customer')}`}
                  avatarIcon='tabler:address-book'
                  linkCard='/customer/data'
                  linkChip={'/customer/data?created_at=' + formatDateFilter(today)}
                />
              </Grid>
              <Grid item xs={4} lg={3}></Grid>
            </>
          )}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {/* Filters */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'space-between'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <PickersRangeMonth
                      label=''
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

                    <Button
                      variant={quickDate == 'today' ? 'contained' : 'outlined'}
                      color='primary'
                      onClick={handleToday}
                    >
                      {t('Today')}
                    </Button>
                    <Button
                      variant={quickDate == 'yesterday' ? 'contained' : 'outlined'}
                      color='primary'
                      onClick={handleYesterday}
                    >
                      {t('Yesterday')}
                    </Button>
                    <Button
                      variant={quickDate == 'thisWeek' ? 'contained' : 'outlined'}
                      color='primary'
                      onClick={handleThisWeek}
                    >
                      {t('This Week')}
                    </Button>
                    <Button
                      variant={quickDate == 'thisMonth' ? 'contained' : 'outlined'}
                      color='primary'
                      onClick={handleThisMonth}
                    >
                      {t('This Month')}
                    </Button>
                  </Box>
                  <Box>
                    <Box width={150}>
                      <SelectCustom
                        isFloating
                        label={t('Order Status') ?? 'Order Status'}
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
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {!dataSummaryChart ? (
            <Grid item xs={12}>
              <Card>
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <CircularProgress />
                  <div>Loading...</div>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <>
              <Grid item xs={12}>
                {differenceInDays(startDateRange ?? today, endDateRange ?? today) == 0 ? (
                  <CardChartDashboardDailyNew
                    data={dataSummaryChart}
                    startDate={startDateRange as Date}
                    endDate={endDateRange as Date}
                  />
                ) : (
                  <CardChartDashboard
                    data={dataSummaryChart}
                    startDate={startDateRange as Date}
                    endDate={endDateRange as Date}
                  />
                )}
              </Grid>
              <Grid item xs={6} lg={4}>
                <CardTopProduct
                  data={dataTopProduct ?? []}
                  viewAllHref={`/reports/sales/sales/product?startDate=${formatDateFilter(
                    startDateRange ?? defaultStartDate
                  )}&endDate=${formatDateFilter(endDateRange ?? defaultEndDate)}`}
                />
              </Grid>
              <Grid item xs={6} lg={4}>
                <CardTopCategory
                  data={dataTopCategory ?? []}
                  viewAllHref={`/reports/sales/sales/category?startDate=${formatDateFilter(
                    startDateRange ?? defaultStartDate
                  )}&endDate=${formatDateFilter(endDateRange ?? defaultEndDate)}`}
                />
              </Grid>
              <Grid item xs={6} lg={4}>
                <CardTopCustomer
                  data={dataTopCustomer ?? []}
                  viewAllHref={`/reports/sales/sales/customer?startDate=${formatDateFilter(
                    startDateRange ?? defaultStartDate
                  )}&endDate=${formatDateFilter(endDateRange ?? defaultEndDate)}`}
                />
              </Grid>
            </>
          )}
        </Grid>
      </KeenSliderWrapper>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
