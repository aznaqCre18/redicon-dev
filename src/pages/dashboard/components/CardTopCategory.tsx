// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Component Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useTranslation } from 'react-i18next'
import { DashboardTopCategory } from 'src/types/apps/dashboard/dashboard'
import { Typography } from '@mui/material'
import Link from 'next/link'

const donutColors = [
  '#fdd835',
  '#00d4bd',
  '#826bf8',
  '#1FD5EB',
  '#ffa1a1',
  '#FF4560',
  '#775DD0',
  '#FEB019'
]

const CardTopCategory = ({
  data,
  viewAllHref
}: {
  data: DashboardTopCategory[]
  viewAllHref: string
}) => {
  const { t } = useTranslation()
  // ** Hook
  const theme = useTheme()

  const bigestCategory =
    data.length > 0 ? data.reduce((a, b) => (a.quantity_sold > b.quantity_sold ? a : b)) : null

  const options: ApexOptions = {
    stroke: { width: 0 },
    labels: data.map(item => item.name),
    colors: [
      donutColors[0],
      donutColors[1],
      donutColors[2],
      donutColors[3],
      donutColors[4],
      donutColors[5],
      donutColors[6],
      donutColors[7]
    ],
    dataLabels: {
      enabled: true,
      formatter: (val: string) => `${parseInt(val, 10)}%`
    },
    legend: {
      position: 'bottom',
      markers: { offsetX: -3 },
      labels: { colors: theme.palette.text.secondary },
      itemMargin: {
        vertical: 3,
        horizontal: 10
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.2rem'
            },
            value: {
              fontSize: '1.2rem',
              color: theme.palette.text.secondary,
              formatter: (val: string) => `${parseInt(val, 10)}`
            },
            total: {
              show: true,
              fontSize: '1.2rem',
              label: bigestCategory?.name ?? '',
              formatter: () => (bigestCategory?.quantity_sold ?? '') + '',
              color: donutColors[0]
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: theme.typography.body1.fontSize
                  },
                  value: {
                    fontSize: theme.typography.body1.fontSize
                  },
                  total: {
                    fontSize: theme.typography.body1.fontSize
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card
      sx={{
        height: '100%'
      }}
    >
      <CardHeader
        title={`Top ${t('Category')}`}
        action={
          <Typography
            className='hover-underline'
            noWrap
            variant='body2'
            sx={{
              color: 'primary.main',
              fontWeight: 600
            }}
            component={Link}
            href={viewAllHref}
          >
            {t('View All')}
          </Typography>
        }
      />
      <CardContent>
        <ReactApexcharts
          type='donut'
          options={options}
          series={data.map(item => item.quantity_sold)}
          height={340}
        />
      </CardContent>
    </Card>
  )
}

export default CardTopCategory
