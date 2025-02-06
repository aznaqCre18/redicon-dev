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
import { addHours, format, getHours, setHours } from 'date-fns'
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

const CardChartDashboardDailyNew = ({
  data,
  startDate,
  endDate
}: {
  data: DashboardSummaryChart[]
  startDate: Date
  endDate: Date
}) => {
  const { t } = useTranslation()
  // ** Hook

  const theme = useTheme()

  const [hideSeries, setHideSeries] = useState<string[]>([])

  const [_data, setData] = useState<DashboardSummaryChart[]>([])

  const [categoriesDate, setCategoriesDate] = useState<Date[]>()

  const [seriesOptions, setSeriesOptions] = useState<SeriesOptions>()

  const handleHideSeries = (name: string) => {
    if (hideSeries.includes(name)) {
      setHideSeries(hideSeries.filter(s => s !== name))
    } else {
      setHideSeries([...hideSeries, name])
    }
  }

  useEffect(() => {
    const penjualan = _data.map(c => {
      const found = _data.find(d => d.order_date == c.order_date)

      return found ? found.total_sales : 0
    })

    const PenjualanBruto = _data.map(c => {
      const found = _data.find(d => d.order_date == c.order_date)

      return found ? found.total_grand_sales : 0
    })

    const pesanan = _data.map(c => {
      const found = _data.find(d => d.order_date == c.order_date)

      return found ? found.total_orders : 0
    })

    const produkTerjual = _data.map(c => {
      const found = _data.find(d => d.order_date == c.order_date)

      return found ? found.total_product_sold : 0
    })

    const pelanggan = _data.map(c => {
      const found = _data.find(d => d.order_date == c.order_date)

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
        categories: _data.map(d => format(new Date(d.order_date), 'HH:mm'))
      }
    }

    setSeriesOptions({
      series: newSeries2,
      options: newOptions
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesDate, _data, hideSeries])

  useEffect(() => {
    const getDateYmd = format(startDate, 'yyyy-MM-dd')

    // create array 24 hours from getDateYmd
    const arr24Hours = Array.from({ length: 24 }, (_, i) => {
      return addHours(new Date(`${getDateYmd}T00:00:00Z`), i - 7).toISOString()
    })

    setData(
      arr24Hours.map(d => {
        const date = new Date(d)
        const found = data.find(
          dd =>
            format(addHours(new Date(dd.order_date), -7), 'yyyy-MM-ddTHH:mm:ss') ==
            format(date, 'yyyy-MM-ddTHH:mm:ss')
        )

        const newData = found
          ? {
              ...found,
              order_date: d
            }
          : {
              order_date: d,
              total_sales: 0,
              total_grand_sales: 0,
              total_orders: 0,
              total_product_sold: 0,
              total_customers: 0,
              sales_average: 0
            }

        return newData
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

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
              value={formatPriceIDR(_data.reduce((acc, curr) => acc + curr.total_sales, 0))}
              color='success.main'
              isHidden={hideSeries.includes('Penjualan Neto')}
              onClick={() => handleHideSeries('Penjualan Neto')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title={t('Sale') + ' (Bruto)'}
              value={formatPriceIDR(_data.reduce((acc, curr) => acc + curr.total_grand_sales, 0))}
              color='warning.main'
              isHidden={hideSeries.includes('Penjualan Bruto')}
              onClick={() => handleHideSeries('Penjualan Bruto')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Order'
              value={formatNumber(_data.reduce((acc, curr) => acc + curr.total_orders, 0))}
              color='info.main'
              isHidden={hideSeries.includes('Pesanan')}
              onClick={() => handleHideSeries('Pesanan')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Product Sold'
              value={formatNumber(_data.reduce((acc, curr) => acc + curr.total_product_sold, 0))}
              color='DarkOrchid'
              isHidden={hideSeries.includes('Produk Terjual')}
              onClick={() => handleHideSeries('Produk Terjual')}
            />
          </Grid>
          <Grid item xs={2}>
            <CardChartItem
              title='Customer'
              value={formatNumber(_data.reduce((acc, curr) => acc + curr.total_customers, 0))}
              color='SlateBlue'
              isHidden={hideSeries.includes('Pelanggan')}
              onClick={() => handleHideSeries('Pelanggan')}
            />
          </Grid>
          <Grid item xs={3}>
            <CardChartItem
              title='Sales per Customer'
              value={formatPriceIDR(
                _data.reduce((acc, curr) => acc + curr.sales_average, 0) / _data.length,
                0
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

export default CardChartDashboardDailyNew
