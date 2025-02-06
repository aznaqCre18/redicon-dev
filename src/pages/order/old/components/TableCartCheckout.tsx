import { Icon } from '@iconify/react'
import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material'
import Link from 'next/link'
import React, { useState } from 'react'
import { formatDate } from 'src/utils/dateUtils'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { OrderFullDetailType } from 'src/types/apps/order'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import CountDownComponent from './CountDownComponent'
import { addHours } from 'date-fns'
import { useMutation, useQueryClient } from 'react-query'
import { orderService } from 'src/services/order'
import toast from 'react-hot-toast'
import MiniImage from './MiniImage'
import TableCartRow from './TableCartRow'
import { useTranslation } from 'react-i18next'
import PrintOrderDialog from './PrintOrderDialog'
import { devMode } from 'src/configs/dev'
import DialogConfirmation from 'src/views/components/dialogs/DialogConfirmation'
import clipboardCopy from 'clipboard-copy'

type props = {
  isLoading: boolean
  data: OrderFullDetailType[]
  itemSelected: OrderFullDetailType[]
  checkedAll: boolean
  handleChangeCheckbox: (e: boolean, id: string, item?: OrderFullDetailType) => void
  tabValue: string
}

const TableCartCheckout = ({
  isLoading,
  data,
  itemSelected,
  checkedAll,
  handleChangeCheckbox,
  tabValue
}: props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isCheckboxIndeterminate = itemSelected.length > 0 && !checkedAll

  const { mutate: updateStatusOrder } = useMutation(orderService.updateStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('order-list')
      toast.success(t('Data updated successfully.'))
    }
  })

  const [printOrder, setPrintOrder] = React.useState<OrderFullDetailType | undefined>()

  const { mutate: updatePrintOrder } = useMutation(orderService.updatePrint, {
    onSuccess: () => {
      queryClient.invalidateQueries('order-list')
      toast.success(t('Success print shipping label.'))
    }
  })

  const printPage = (order: OrderFullDetailType, is_print: boolean) => {
    if (!is_print) updatePrintOrder({ id: order.order.id, is_print: true })

    setPrintOrder(order)
  }

  const [isOpenCancelTrolley, setIsOpenCancelTrolley] = useState<number | undefined>(undefined)

  const openCancelTrolley = (id: number) => {
    setIsOpenCancelTrolley(id)
  }

  const closeCancelTrolley = () => {
    setIsOpenCancelTrolley(undefined)
  }

  const handleCancelTrolley = () => {
    if (isOpenCancelTrolley == undefined) return

    orderService.cancelBatchTrolley([isOpenCancelTrolley]).then(() => {
      queryClient.invalidateQueries('trolley-list')
      queryClient.invalidateQueries('order-status-count')

      toast.success(t('Data updated successfully.'))
    })

    closeCancelTrolley()
  }

  return (
    <>
      <Grid container gap={2}>
        <Grid
          py={2}
          item
          borderRadius={1}
          sx={theme => ({
            backgroundColor: theme.palette.customColors.tableHeaderBg,
            borderColor: theme.palette.divider,
            borderWidth: '1px',
            borderStyle: 'solid',
            marginBottom: 2
          })}
          container
          alignItems={'center'}
          columns={10}
        >
          <Grid item xs={3} px={2} display={'flex'} alignItems={'center'}>
            <Checkbox
              checked={checkedAll}
              indeterminate={isCheckboxIndeterminate}
              sx={{ p: 0, mr: 2 }}
              onChange={e => handleChangeCheckbox(e.target.checked, 'all')}
            />
            <div>{t('Product')}</div>
          </Grid>
          <Grid item xs={1}>
            {t('Price')}
          </Grid>
          <Grid item xs={1}>
            {t('Total')}
          </Grid>
          <Grid item xs={2}>
            {tabValue != 'TROLLEY' && t('Method')}
          </Grid>
          <Grid item xs={2}>
            {tabValue != 'TROLLEY' && t('Status')}
          </Grid>
          <Grid item xs={1} textAlign={'end'} px={2}>
            {t('Action')}
          </Grid>
        </Grid>
        {isLoading ? (
          <Grid
            item
            width={'100%'}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <CircularProgress />
            <Typography>{t('Loading') + '...'}</Typography>
          </Grid>
        ) : data.length == 0 ? (
          <Grid
            item
            width={'100%'}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography>{t('No data')}</Typography>
          </Grid>
        ) : (
          <Grid item width={'100%'}>
            {data.map((item, index) => (
              <Box
                key={index}
                borderRadius={1}
                sx={theme => ({
                  backgroundColor: theme.palette.customColors.tableHeaderBg,
                  borderColor: theme.palette.divider,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  marginBottom: 2
                })}
              >
                <Grid py={2} container alignItems={'center'} columns={10}>
                  <Grid item xs={4} px={2} display={'flex'} alignItems={'center'}>
                    <Checkbox
                      sx={{ p: 0, mr: 2 }}
                      checked={itemSelected.includes(item) || false}
                      onChange={e =>
                        handleChangeCheckbox(e.target.checked, item.order.id.toString(), item)
                      }
                      key={item.order.id.toString()}
                    />
                    <Box display={'flex'} alignItems={'center'}>
                      {tabValue == 'TROLLEY' ? (
                        <Tooltip
                          title={
                            <Box
                              sx={{
                                cursor: 'pointer'
                              }}
                              display={'flex'}
                              alignItems={'center'}
                              gap={1}
                              onClick={() => {
                                clipboardCopy(item.order.order_number)
                                toast.success(t('Order number copied'))
                              }}
                            >
                              {item.order.order_number}
                              <Icon icon='akar-icons:copy' fontSize={12} inline color='#aaa' />
                            </Box>
                          }
                          placement='top'
                        >
                          <Typography
                            sx={{
                              maxWidth: 150,
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical'
                            }}
                            fontWeight={600}
                          >
                            {item.order.order_number}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title={
                            <Box
                              sx={{
                                cursor: 'pointer'
                              }}
                              display={'flex'}
                              alignItems={'center'}
                              gap={1}
                              onClick={() => {
                                clipboardCopy(item.order.order_number)
                                toast.success(t('Order number copied'))
                              }}
                            >
                              {item.order.order_number}
                              <Icon icon='akar-icons:copy' fontSize={12} inline color='#aaa' />
                            </Box>
                          }
                          placement='top'
                        >
                          <Typography
                            component={Link}
                            href={`/order/detail/${item.order.id}`}
                            className='hover-underline'
                            sx={{
                              color: 'primary.main',
                              maxWidth: 150,
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical'
                            }}
                            fontWeight={600}
                          >
                            {item.order.order_number}
                          </Typography>
                        </Tooltip>
                      )}
                      {item.order.customer && (
                        <>
                          <span
                            style={{
                              margin: '0 0.5rem'
                            }}
                          >
                            |
                          </span>
                          <Avatar
                            variant='circular'
                            sx={{
                              height: '1.2rem',
                              width: '1.2rem',
                              borderRadius: '100%',
                              mr: 1
                            }}
                            src={
                              item.order.customer.profile_picture
                                ? getImageAwsUrl(item.order.customer.profile_picture)
                                : undefined
                            }
                          />
                          {item.order.customer.name}
                        </>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={3.5}>
                    {t('Order Date')} {formatDate(item.order.created_at)}{' '}
                    {['UNPAID', 'TROLLEY'].includes(item.order.order_status) &&
                      item.order.expired_at && (
                        <>
                          |{' '}
                          <CountDownComponent
                            from={new Date()}
                            to={addHours(new Date(item.order.expired_at), -7)}
                          />
                        </>
                      )}
                  </Grid>
                  <Grid
                    item
                    xs={2.5}
                    textAlign={'end'}
                    px={2}
                    sx={{
                      textTransform: 'capitalize'
                    }}
                  >
                    {t(item.order.order_status).toLowerCase()}
                  </Grid>
                </Grid>
                <Box
                  py={2}
                  borderRadius={1}
                  sx={theme => ({
                    backgroundColor: theme.palette.background.paper
                  })}
                >
                  {(item.order_items ?? []).length > 0 &&
                    (item.order_items ?? []).map((_, index) => {
                      if (index > 0) return

                      return (
                        <Grid container columns={10} key={index}>
                          <TableCartRow item={item} />
                          <Grid item xs={1}>
                            <>
                              <Tooltip
                                title={
                                  <span>
                                    Sub Total:{' '}
                                    {formatPriceIDR(
                                      item.order_items.map(i => i.total).reduce((a, b) => a + b, 0)
                                    )}
                                    {item.order.shipping_cost > 0 && (
                                      <>
                                        <br />
                                        {t('Shipping Cost')}: +
                                        {formatPriceIDR(item.order.shipping_cost)}
                                      </>
                                    )}
                                    {(item.order.shipping_tax ?? 0) > 0 && (
                                      <>
                                        <br />
                                        {t('Shipping Tax')}: +
                                        {formatPriceIDR(item.order.shipping_tax ?? 0)}
                                      </>
                                    )}
                                    {item.order.tax > 0 && (
                                      <>
                                        <br />
                                        {t('Tax')}: +{formatPriceIDR(item.order.tax)}
                                      </>
                                    )}
                                    {item.order.service_charges_mdr > 0 && (
                                      <>
                                        <br />
                                        {t('Service Charge')}: +
                                        {formatPriceIDR(item.order.service_charges_mdr)}
                                      </>
                                    )}
                                    {item.order.global_discount > 0 && (
                                      <>
                                        <br />
                                        Global {t('Discount')}: -
                                        {formatPriceIDR(item.order.global_discount)}
                                      </>
                                    )}
                                    {item.order.global_discount_recap > 0 && (
                                      <>
                                        <br />
                                        Global {t('Discount')}: -
                                        {formatPriceIDR(item.order.global_discount_recap)}
                                      </>
                                    )}
                                  </span>
                                }
                                placement='top'
                              >
                                <Typography variant='body1'>
                                  {formatPriceIDR(item.order.grand_total)}
                                </Typography>
                              </Tooltip>
                              {tabValue != 'TROLLEY' && (
                                <Box display={'flex'}>
                                  <Box
                                    paddingRight={1}
                                    paddingLeft={1}
                                    border={1}
                                    borderRadius={'0.2rem'}
                                    sx={theme => ({
                                      borderColor: theme.palette.divider
                                    })}
                                  >
                                    <Typography variant='body2'>
                                      {item.order.item_qty} Pcs
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </>
                          </Grid>
                          <Grid item xs={2}>
                            {item.order.shipping && (
                              <Box display={'flex'} gap={1} alignItems={'center'} mt={1}>
                                <MiniImage image={item.order.shipping.logo} />
                                <Typography variant='body2'>{item.order.shipping?.name}</Typography>
                              </Box>
                            )}
                            <Box display={'flex'} gap={1} alignItems={'center'} mt={1}>
                              <MiniImage
                                image={
                                  item.order.cod_payment
                                    ? item.order.cod_payment.logo ?? 'expeditions/default/cod1.png'
                                    : item.order.payment_method_detail
                                    ? item.order.payment_method_detail.bank_image
                                    : ''
                                }
                              />
                              <Typography
                                variant='body2'
                                fontWeight={600}
                                color={'green'}
                                textTransform={'capitalize'}
                              >
                                {item.order.cod_payment
                                  ? item.order.cod_payment.name
                                  : item.order.payment_method_detail
                                  ? item.order.payment_method_detail.bank_name
                                  : item.order.payment_method}
                              </Typography>
                            </Box>
                            {/* <Typography variant='body1'>JNE_REGULER</Typography>
                  <Typography variant='body1'>TLJR358457324</Typography> */}
                          </Grid>
                          <Grid item xs={2}>
                            {tabValue != 'TROLLEY' && (
                              <ul
                                style={{
                                  listStyleType: 'none',
                                  marginInline: 0,
                                  marginBlock: 0,
                                  paddingInline: 0
                                }}
                              >
                                <li>
                                  <Box display={'flex'} alignItems={'center'} gap={1}>
                                    <Icon
                                      icon='lets-icons:check-fill'
                                      fontSize={18}
                                      color={item.order.is_print ? 'green' : 'gray'}
                                    />
                                    {item.order.is_print ? t('Printed') : t('Print2')}
                                  </Box>
                                </li>
                                <li>
                                  <Box
                                    display={'flex'}
                                    alignItems={'center'}
                                    gap={1}
                                    className={
                                      !item.order.is_collect ? 'hover-underline' : undefined
                                    }
                                    sx={{
                                      color: !item.order.is_collect ? 'primary.main' : undefined
                                    }}
                                    onClick={() => {
                                      if (!item.order.is_collect)
                                        updatePrintOrder({
                                          id: item.order.id,
                                          is_collect: !item.order.is_collect
                                        })
                                    }}
                                  >
                                    <Icon
                                      icon='lets-icons:check-fill'
                                      fontSize={18}
                                      color={item.order.is_collect ? 'green' : 'gray'}
                                    />
                                    {item.order.is_collect ? t('Picked Up') : t('Pick Up')}
                                  </Box>
                                </li>
                                {/* <li>
                      <Box display={'flex'} alignItems={'center'} gap={1}>
                        <Icon icon='lets-icons:check-fill' fontSize={18} color='green' />
                        Picking List
                      </Box>
                    </li>
                    <li>
                      <Box display={'flex'} alignItems={'center'} gap={1}>
                        <Icon icon='lets-icons:check-fill' fontSize={18} color='green' />
                        Label Pengiriman
                      </Box>
                    </li>
                    <li>
                      <Box display={'flex'} alignItems={'center'} gap={1}>
                        <Icon icon='lets-icons:check-fill' fontSize={18} color='grey' />
                        Label Pengiriman
                      </Box>
                    </li> */}
                              </ul>
                            )}
                          </Grid>
                          <Grid item xs={1} textAlign={'end'} px={2}>
                            <Grid container justifyContent={'end'}>
                              {tabValue != 'TROLLEY' && devMode && (
                                <Grid item>
                                  <Tooltip title={t('Edit')} placement='top'>
                                    <IconButton
                                      LinkComponent={Link}
                                      href={'/order/edit/' + item.order.id}
                                    >
                                      <Icon icon='iconamoon:edit-light' fontSize='0.875rem' />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              )}
                              {['UNPAID'].includes(item.order.order_status) && (
                                <Grid item>
                                  <Tooltip title={t('Cancel Order')} placement='top'>
                                    <IconButton
                                      onClick={() =>
                                        updateStatusOrder({
                                          id: item.order.id,
                                          order_status: 'CANCELED'
                                        })
                                      }
                                    >
                                      <Icon icon='ic:baseline-cancel' fontSize='0.875rem' />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              )}
                              {'ON PROCESS' == item.order.order_status && (
                                <Grid item>
                                  <Tooltip title={t('action_completed')} placement='top'>
                                    <IconButton
                                      onClick={() =>
                                        updateStatusOrder({
                                          id: item.order.id,
                                          order_status: 'COMPLETED'
                                        })
                                      }
                                    >
                                      <Icon icon='bx:bx-check' fontSize='0.875rem' />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              )}
                              {['UNPAID'].includes(item.order.order_status) && (
                                <>
                                  <Grid item>
                                    <Tooltip title={t('action_completed')} placement='top'>
                                      <IconButton
                                        onClick={() =>
                                          updateStatusOrder({
                                            id: item.order.id,
                                            order_status: 'COMPLETED'
                                          })
                                        }
                                      >
                                        <Icon icon='bx:bx-check' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item>
                                    <Tooltip title={t('action_process')} placement='top'>
                                      <IconButton
                                        onClick={() =>
                                          updateStatusOrder({
                                            id: item.order.id,
                                            order_status: 'ON PROCESS'
                                          })
                                        }
                                      >
                                        <Icon icon='uim:process' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </>
                              )}
                              {tabValue != 'TROLLEY' && (
                                <>
                                  <Grid item>
                                    <Tooltip title='Detail' placement='top'>
                                      <IconButton
                                        component={Link}
                                        href={`/order/detail/${item.order.id}`}
                                      >
                                        <Icon icon='bx:detail' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>

                                  <Grid item>
                                    <Tooltip title={t('History')} placement='top'>
                                      <IconButton>
                                        <Icon icon='mdi:history' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item>
                                    <Tooltip title={t('Print')} placement='top'>
                                      <IconButton
                                        onClick={() => printPage(item, item.order.is_print)}
                                      >
                                        <Icon icon='mingcute:print-fill' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </>
                              )}

                              {tabValue == 'TROLLEY' && (
                                <>
                                  <Grid item>
                                    <Tooltip title={t('Cancel Order')} placement='top'>
                                      <IconButton onClick={() => openCancelTrolley(item.order.id)}>
                                        <Icon icon='ic:baseline-cancel' fontSize='0.875rem' />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      )
                    })}
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </Grid>
      <PrintOrderDialog orderData={printOrder} onClose={() => setPrintOrder(undefined)} />
      <DialogConfirmation
        open={isOpenCancelTrolley != undefined}
        handleClose={closeCancelTrolley}
        handleConfirm={handleCancelTrolley}
        loading={false}
        name='Trolley'
        action='Cancel2'
      />
    </>
  )
}

export default TableCartCheckout
