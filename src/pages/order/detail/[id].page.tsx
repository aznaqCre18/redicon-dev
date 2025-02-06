import { Icon } from '@iconify/react'
import { Box, Card, CardContent, Divider, Grid, IconButton, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'
import useClipboard from 'src/@core/hooks/useClipboard'
import { orderService } from 'src/services/order'
import { OrderFullDetailType } from 'src/types/apps/order'
import { formatDate } from 'src/utils/dateUtils'
import TableDetailOrder from './components/TableDetailOrder'
import { useTranslation } from 'react-i18next'

const Seperate = () => (
  <span
    style={{
      marginRight: 12
    }}
  >
    :
  </span>
)

const GridFieldData = ({ label, value }: { label: string; value?: string | null | ReactNode }) => (
  <Grid container alignItems={'end'}>
    <Grid item xs={12} md={4}>
      {label}
    </Grid>
    <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'end' }}>
      <Seperate />
      {value}
    </Grid>
  </Grid>
)

// const GridFieldIcon = ({ icon, value }: { icon: string; value?: string | null }) => (
//   <Grid item sm={12} rowGap={1}>
//     <span
//       style={{
//         marginRight: 12
//       }}
//     >
//       <Icon icon={icon} />
//     </span>
//     {value}
//   </Grid>
// )

const DetailOrderPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const clipboard = useClipboard()

  // const { bussiness } = useAuth()

  const { id: orderId } = router.query
  const [order, setOrder] = React.useState<OrderFullDetailType | undefined>()

  useQuery(['get-order-detail', orderId], {
    enabled: !!orderId,
    queryFn: () => orderService.getOne(orderId as string),
    onSuccess: data => {
      setOrder(data.data.data)
    }
  })

  const handleCopy = (value: string) => {
    clipboard.copy(value)

    toast.success(t('Order number copied'))
  }

  if (!order) {
    return null
  }

  return (
    <Box display={'flex'} flexDirection={'column'} gap={4}>
      <Card>
        <CardContent sx={{ p: 6 }}>
          {/* <Box height={'32px'} alignItems={'center'}>
            <Typography fontWeight={'600'}>{t('Order Infomation')}</Typography>
          </Box> */}

          <Grid container spacing={10} columns={11}>
            <Grid item xs={12} md={5}>
              {/* <Box mb={2}>{bussiness?.name}</Box> */}
              <Grid container rowGap={1}>
                <GridFieldData
                  label={t('Order ID')}
                  value={
                    <>
                      {order.order.order_number}{' '}
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={() => handleCopy(order.order.order_number)}
                        sx={{ ml: 1 }}
                      >
                        <Icon icon='mingcute:copy-2-line' fontSize={'1rem'} />
                      </IconButton>
                    </>
                  }
                />
                <GridFieldData label={t('Date Order')} value={formatDate(order.order.created_at)} />
                {/* <GridFieldData label={t('Outlet')} value={order.order.outlet_name} /> */}
                <GridFieldData label={t('Requestor')} value={order.order.customer?.name} />
                <GridFieldData label={t('Departement')} value={'Name'} />
                <GridFieldData label={t('Cost Center')} value={'Name'} />
                <GridFieldData label={t('G/L Account')} value={'Name'} />
                <GridFieldData label={t('HOD')} value={'Name'} />
                <GridFieldData label={t('Order Status')} value={t(order.order.order_status)} />
                {/* <GridFieldData label={t('Type Order')} value={t(order.order.order_type)} /> */}
                {order.order.outlet && (
                  <GridFieldData label={t('Outlet')} value={order.order.outlet.name ?? '-'} />
                )}
                {order.employees && order.employees.length > 0 ? (
                  <GridFieldData
                    label={t('Employee')}
                    value={t(order.employees.map(item => item.name).join(', '))}
                  />
                ) : (
                  order.employee && (
                    <GridFieldData label={t('Employee')} value={t(order.employee.name)} />
                  )
                )}
                {/* <GridFieldData label={t('Cashier')} value={t(order.order.created_by_name)} /> */}
                {/* <GridFieldData label={t('Division')} value={t(order.order.division_name)} /> */}
                {/* <GridFieldData label={t('Sales Person')} value='' /> */}
              </Grid>
            </Grid>
            <Grid item md={1}>
              <Divider orientation='vertical' />
            </Grid>
            <Grid item xs={12} md={5}>
              {/* <Grid container>
                <GridFieldData label={t('Customer')} value={order.order.customer?.name} />
              </Grid>
              <Divider
                sx={{
                  my: 2
                }}
              />
              <Grid container>
                <GridFieldData label={t('Payment Status')} value={t(order.order.payment_status)} />
                <GridFieldData
                  label={t('Payment')}
                  value={
                    order.order_payments && order.order_payments.length > 0
                      ? order.order_payments
                          .map(item =>
                            [
                              t(item.payment_method),
                              item.payment_method_detail?.bank_name ??
                                item.payment_method_detail?.payment_name ??
                                undefined
                            ]
                              .filter(item => item != undefined)
                              .join(' - ')
                          )
                          .join(', ')
                      : order.order.cod_payment
                      ? order.order.cod_payment.name
                      : order.order.payment_method_detail
                      ? t(order.order.payment_method) +
                        ' - ' +
                        order.order.payment_method_detail.bank_name
                      : t(order.order.payment_method)
                  }
                />
              </Grid>
              <Divider
                sx={{
                  my: 2
                }}
              /> */}
              <Grid container>
                <GridFieldData
                  label={t('Recipient Name')}
                  value={order.order.customer_address?.name ?? order.order.customer?.name}
                />
                {/* <GridFieldData label={t('Logistic')} value={order.order.shipping?.name ?? '-'} /> */}
                <GridFieldData
                  label={t('Recipient Phone')}
                  value={order.order.customer_address?.phone ?? order.order.customer?.phone}
                />
                <GridFieldData
                  label={t('Address')}
                  value={[
                    order.order.customer_address?.address,
                    order.order.customer_addresses_detail?.sub_district?.name,
                    order.order.customer_addresses_detail?.district?.name,
                    order.order.customer_addresses_detail?.province?.name,
                    order.order.customer_address?.postal_code
                  ]
                    .filter(item => item != undefined)
                    .join(', ')}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <TableDetailOrder order={order} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default DetailOrderPage
