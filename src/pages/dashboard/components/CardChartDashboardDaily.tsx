/* eslint-disable @typescript-eslint/no-unused-vars */
// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { Grid } from '@mui/material'
import { formatNumber, formatPriceIDR } from 'src/utils/numberUtils'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { DashboardSummaryChart } from 'src/types/apps/dashboard/dashboard'
import { rangeDateValue } from 'src/utils/apiUtils'
import { orderService } from 'src/services/order'
import { useQuery } from 'react-query'
import { addHours, getHours } from 'date-fns'
import { PageOptionRequestType } from 'src/types/pagination/pagination'

type Series = {
  name: string
  data: number[]
}

type SeriesOptions = {
  series: Series[]
  options: ApexOptions
}

const CardChartItem = ({
  title,
  value,
  color,
  isHidden,
  onClick
}: {
  title?: string
  value?: string | number
  color?: string
  isHidden?: boolean
  onClick?: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Box
      onClick={onClick}
      sx={{
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        ...(color && {
          ...(!isHidden && {
            borderBottom: 4,
            borderBottomColor: color
          }),
          '&:hover': {
            cursor: 'pointer',
            boxShadow: theme => theme.shadows[2],
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        })
      }}
    >
      <CardContent>
        <Typography sx={{ mb: 1 }} variant='body2'>
          {t(title ?? '') ?? title}
        </Typography>
        <Typography variant='h6'>{value}</Typography>
      </CardContent>
    </Box>
  )
}

const CardChartDashboardDaily = ({
  date,
  dataSummary
}: {
  date: Date
  dataSummary: DashboardSummaryChart
}) => {
  const { t } = useTranslation()
  // ** Hook
  const [data, setData] = useState<DashboardSummaryChart[]>([])

  const [categoriesDate, setCategoriesDate] = useState<Date[]>()

  const defaultPaginationOrder: PageOptionRequestType = {
    limit: 999999,
    page: 1,
    sort: 'asc',
    order: 'created_at',
    order_status: 'COMPLETED',
    created_at: rangeDateValue(date, date)
  }

  useQuery(['order-list', defaultPaginationOrder], {
    queryFn: () => orderService.getListV2(defaultPaginationOrder),
    onSuccess: data => {
      const _data = data?.data.data ?? []

      const _allData = _data.map(d => {
        return {
          order_date: d.order.created_at,
          total_sales: d.order.grand_total,
          total_orders: 1,
          total_product_sold: d.order_items?.length ?? 0,
          customer_name: d.order.customer_id
        }
      })

      // group by hour order_date
      let _groupHours = _allData.reduce((acc, curr) => {
        const date = new Date(curr.order_date)
        // get Hours
        const hour = getHours(addHours(typeof date == 'string' ? new Date(date) : date, -7))

        if (!acc[hour]) {
          acc[hour] = []
        }

        let customers = acc[hour].map((d: any) => d.customer_name)
        // if distinct customer
        if (!customers.includes(curr.customer_name)) {
          customers = [...customers, curr.customer_name]
        }

        acc[hour].push({
          order_date: hour + ':00',
          total_sales: curr.total_sales,
          total_orders: curr.total_orders,
          total_product_sold: curr.total_product_sold,
          customers: customers,
          total_customers: customers.length,
          sales_average: curr.total_sales / customers.length
        })

        return acc
      }, {} as Record<number, any>)

      // _groupHours 24 hours
      _groupHours = Array.from({ length: 24 }, (_, i) => {
        return _groupHours[i] ?? []
      })

      const _valiData: DashboardSummaryChart[] = Object.keys(_groupHours).map(key => {
        return {
          order_date: key + ':00',
          total_sales: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.total_sales,
            0
          ),
          total_grand_sales: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.total_grand_sales,
            0
          ),
          total_orders: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.total_orders,
            0
          ),
          total_product_sold: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.total_product_sold,
            0
          ),
          total_customers: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.total_customers,
            0
          ),
          sales_average: _groupHours[key as any].reduce(
            (acc: number, curr: any) => acc + curr.sales_average,
            0
          )
        } as DashboardSummaryChart
      })

      setData(_valiData)
    },
    cacheTime: 0
  })

  const theme = useTheme()

  const [hideSeries, setHideSeries] = useState<string[]>([])

  const [seriesOptions, setSeriesOptions] = useState<SeriesOptions>()

  const handleHideSeries = (name: string) => {
    if (hideSeries.includes(name)) {
      setHideSeries(hideSeries.filter(s => s !== name))
    } else {
      setHideSeries([...hideSeries, name])
    }
  }

  useEffect(() => {
    // if (categoriesDate) {
    const penjualan = data.map(c => {
      const found = data.find(d => d.order_date == c.order_date)

      return found ? found.total_sales : 0
    })

    const PenjualanBruto = data.map(c => {
      const found = data.find(d => d.order_date == c.order_date)

      return found ? found.total_grand_sales : 0
    })

    const pesanan = data.map(c => {
      const found = data.find(d => d.order_date == c.order_date)

      return found ? found.total_orders : 0
    })

    const produkTerjual = data.map(c => {
      const found = data.find(d => d.order_date == c.order_date)

      return found ? found.total_product_sold : 0
    })

    const pelanggan = data.map(c => {
      const found = data.find(d => d.order_date == c.order_date)

      return found ? found.total_customers : 0
    })

    //   let hasData = true

    //   if (penjualan.filter(d => d > 0).length == 0 && pesanan.filter(d => d > 0).length == 0 && produkTerjual.filter(d => d > 0).length == 0 && pelanggan.filter(d => d > 0).length == 0){
    //     hasData = false
    // }

    const newSeries = [
      {
        name: 'Penjualan Neto',
        data: penjualan
      },
      {
        name: 'Penjualan Bruto',
        data: PenjualanBruto
      },
      {
        name: 'Pesanan',
        data: pesanan
      },
      {
        name: 'Produk Terjual',
        data: produkTerjual
      },
      {
        name: 'Pelanggan',
        data: pelanggan
      }
    ]

    const newSeries2 = newSeries.filter(s => {
      if (
        hideSeries.includes(s.name) ||
        (s.name == 'Pelanggan' && s.data.filter(d => d > 0).length == 0) ||
        (s.name == 'Produk Terjual' && s.data.filter(d => d > 0).length == 0)
      ) {
        return false
      }

      return true
    })

    const newOptions: ApexOptions = {
      chart: {
        parentHeightOffset: 0,
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      colors: [
        ...(!hideSeries.includes('Penjualan Neto') ? [theme.palette.success.main] : []),
        ...(!hideSeries.includes('Penjualan Bruto') ? [theme.palette.warning.main] : []),
        ...(!hideSeries.includes('Pesanan') ? [theme.palette.info.main] : []),
        ...(!hideSeries.includes('Produk Terjual') ? ['DarkOrchid'] : []),
        ...(!hideSeries.includes('Pelanggan') ? ['SlateBlue'] : []),
        theme.palette.divider
      ],
      stroke: { curve: 'straight', width: 3 },
      dataLabels: { enabled: false },
      markers: {
        strokeWidth: 7,
        strokeOpacity: 1,
        strokeColors: ['#fff', '#fff']
      },
      grid: {
        padding: { top: -10 },
        borderColor: theme.palette.divider,
        xaxis: {
          lines: { show: true }
        }
      },
      tooltip: {
        custom(data: any) {
          let html = ''

          newSeries2.forEach((s, i) => {
            html += `<div class='apexcharts-tooltip-series'>${s.name}: <b>${
              s.name == 'Penjualan Neto' || s.name == 'Penjualan Bruto'
                ? formatPriceIDR(data.series[i][data.dataPointIndex])
                : formatNumber(data.series[i][data.dataPointIndex])
            }</b></div>`
          })

          return `<div class='bar-chart'>
          ${html}
          </div>`
        }
      },
      yaxis: [
        {
          labels: {
            show: false
          }
        },
        {
          opposite: true,
          labels: {
            show: false
          }
        },
        {
          opposite: true,
          labels: {
            show: false
          }
        }
      ],
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { color: theme.palette.divider },
        crosshairs: {
          stroke: { color: theme.palette.divider }
        },
        labels: {
          style: { colors: theme.palette.text.disabled }
        },
        categories: data.map(d => d.order_date)
      }
    }

    setSeriesOptions({
      series: newSeries2,
      options: newOptions
    })

    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesDate, data, hideSeries])

  // useEffect(() => {
  //   const newCategoriesDate = Array.from(
  //     { length: endDate.getDate() - startDate.getDate() + 1 },
  //     (_, i) => {
  //       const date = new Date(startDate)
  //       date.setDate(date.getDate() + i)

  //       return date
  //     }
  //   )

  //   setCategoriesDate(newCategoriesDate)
  // }, [startDate, endDate])

  if (!seriesOptions) {
    return <></>
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} mb={8} columns={13}>
          <Grid item xs={2}>
            <CardChartItem
              title={t('Sale') + ' (Neto)'}
              value={formatPriceIDR(dataSummary?.total_sales ?? 0)}
              color='success.main'
              isHidden={hideSeries.includes('Penjualan Neto')}
              onClick={() => handleHideSeries('Penjualan Neto')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title={t('Sale') + ' (Bruto)'}
              value={formatPriceIDR(dataSummary?.total_grand_sales ?? 0)}
              color='warning.main'
              isHidden={hideSeries.includes('Penjualan Bruto')}
              onClick={() => handleHideSeries('Penjualan Bruto')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Order'
              value={formatNumber(dataSummary?.total_orders ?? 0)}
              color='info.main'
              isHidden={hideSeries.includes('Pesanan')}
              onClick={() => handleHideSeries('Pesanan')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Product Sold'
              value={formatNumber(dataSummary?.total_product_sold ?? 0)}
              color='DarkOrchid'
              isHidden={hideSeries.includes('Produk Terjual')}
              onClick={() => handleHideSeries('Produk Terjual')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Customer'
              value={formatNumber(dataSummary?.total_customers ?? 0)}
              color='SlateBlue'
              isHidden={hideSeries.includes('Pelanggan')}
              onClick={() => handleHideSeries('Pelanggan')}
            />
          </Grid>
          <Grid item xs={3}>
            <CardChartItem
              title='Sales per Customer'
              value={formatPriceIDR(
                dataSummary?.total_customers > 0
                  ? dataSummary?.total_sales / dataSummary?.total_customers
                  : 0
              )}
            />
          </Grid>
        </Grid>
        <ReactApexcharts
          type='line'
          height={400}
          options={seriesOptions.options}
          series={seriesOptions.series}
        />
      </CardContent>
    </Card>
  )
}

export default CardChartDashboardDaily
