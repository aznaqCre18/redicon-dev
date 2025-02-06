import { Button, Grid, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import CustomTextField from 'src/components/form/CustomTextField'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import Select, { SelectOption } from 'src/components/form/select/Select'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { orderService } from 'src/services/order'
import { bankVendorService } from 'src/services/vendor/bank-vendor'
import { OrderFullDetailType } from 'src/types/apps/order'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { formatPriceIDR } from 'src/utils/numberUtils'
import { promise } from 'src/utils/promise'
import Dialog from 'src/views/components/dialogs/Dialog'

const ScanOrder = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [orderNumber, setOrderNumber] = React.useState<string>('')
  const [orderNumbers, setOrderNumbers] = React.useState<string[]>([])
  const [orderQtyScanned, setOrderQtyScanned] = React.useState<number>(0)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false)

  //   Dialog Error
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isErrorDifferentCustomer,
    setIsErrorDifferentCustomer
  ] = React.useState<boolean>(false)
  const [isShowErrorDialog, setIsShowErrorDialog] = React.useState<boolean>(false)
  const [errorHtml, setErrorHtml] = React.useState<React.ReactNode>(<></>)

  React.useEffect(() => {
    if (orderQtyScanned == orderNumbers.length) {
      setIsLoading(false)

      //   check different customer
      const customerIds = ordersScanned.map(order => order.order.customer.id)
      const customerIdFirst = customerIds[0]
      const isDifferentCustomer = customerIds.some(customerId => customerId != customerIdFirst)

      if (isDifferentCustomer) {
        setErrorHtml(
          <>
            Pesanan tidak dapat diproses karena terdapat perbedaan pelanggan pada pesanan yang
            dipilih.
            <ul>
              {ordersScanned.map(order => (
                <li key={order.order.id}>
                  {t('Order ID')}: {order.order.order_number} | Pelanggan:{' '}
                  {order.order.customer.name}
                </li>
              ))}
            </ul>
          </>
        )
        toast.error(
          'Pesanan tidak dapat diproses karena terdapat perbedaan pelanggan pada pesanan yang dipilih.'
        )
        setIsShowErrorDialog(true)
      } else {
        setIsSuccess(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderQtyScanned])

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orders,
    setOrders
  ] = React.useState<OrderFullDetailType[]>([])
  const [ordersScanned, setOrdersScanned] = React.useState<OrderFullDetailType[]>([])

  //   Dialog Scan Checkout
  const [bankTransferOptions, setBankTransferOptions] = React.useState<SelectOption[]>([])

  const [globalDiscount, setGlobalDiscount] = React.useState<number>(0)
  const [paymentMethod, setPaymentMethod] = React.useState<string>('default')
  const [bankTransfer, setBankTransfer] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    setBankTransfer(undefined)
  }, [paymentMethod])

  const { mutate: getBanks } = useMutation('get-banks', bankVendorService.getList, {
    onSuccess: data => {
      setBankTransferOptions(
        data.data.data.map(item => ({
          label: `${item.bank_name} (${item.account_number} - ${item.account_name})`,
          value: item.id
        }))
      )
    }
  })

  const { mutate: getOrderByOrderNumber } = useMutation(
    'search-order',
    orderService.findByOrderNumber,
    {
      onSuccess: data => {
        setOrderQtyScanned(old => old + 1)

        const _data = data.data.data ?? []

        const order = _data.filter(
          item =>
            ['UNPAID', 'ON PROCESS', 'ON DELIVERY'].includes(item.order.order_status) &&
            orderNumbers.includes(item.order.order_number)
        )

        setOrders(old => [...old, ..._data])
        setOrdersScanned(old => [...old, ...order])

        if (order.length == 0) {
          toast.error(
            `Nomor pesanan ${_data.length > 0 ? _data[0].order.order_number : ''} tidak ditemukan.`
          )

          //   if (orderNumbers.length > 1) {
          //     setErrorHtml(old => (
          //       <>
          //         {old}
          //         <Box>
          //           <p>
          //             Nomor pesanan <i>{_data.length > 0 ? _data[0].order.order_number : ''}</i> tidak
          //             ditemukan.
          //           </p>
          //         </Box>
          //       </>
          //     ))
          //     setIsShowErrorDialog(true)
          //   }
        }
      }
    }
  )

  const handleScan = () => {
    setIsLoading(true)

    setOrderQtyScanned(0)
    setOrdersScanned([])
    setOrders([])

    setIsErrorDifferentCustomer(false)
    setErrorHtml(<></>)
    setIsShowErrorDialog(false)

    setIsSuccess(false)

    setGlobalDiscount(0)
    setPaymentMethod('default')
    setBankTransfer(undefined)

    getBanks({ ...maxLimitPagination, order: 'bank_name' })

    if (orderNumber !== '') {
      const orderNumbers = orderNumber.replaceAll(' ', '').split(',')
      //   delete if duplicate order number
      const uniqueOrderNumbers = orderNumbers.filter((v, i, a) => a.indexOf(v) === i)

      setOrderNumbers(uniqueOrderNumbers)

      uniqueOrderNumbers.map(_orderNumber => {
        promise(() => {
          getOrderByOrderNumber(_orderNumber)
        }, 200)
      })
    } else {
      setIsLoading(false)
      toast.error('Harap isi terlebih dahulu nomor pesanan')
    }
  }

  const handleReset = () => {
    setOrderNumber('')
    setOrderQtyScanned(0)
    setOrdersScanned([])
    setOrders([])

    setIsErrorDifferentCustomer(false)
    setErrorHtml(<></>)
    setIsShowErrorDialog(false)

    setIsSuccess(false)

    setGlobalDiscount(0)
    setPaymentMethod('default')
    setBankTransfer(undefined)
  }

  const { mutate: updateOrders, isLoading: isLoadingUpdateOrders } = useMutation(
    'update-orders',
    orderService.updateBatchOrderScan,
    {
      onSuccess: () => {
        toast.success(t('Data updated successfully.'))
        setIsSuccess(false)
        handleReset()

        queryClient.invalidateQueries('order-status-count')
        queryClient.invalidateQueries('order-list')
      }
    }
  )

  const handleSubmit = () => {
    updateOrders(
      ordersScanned.map(order => ({
        order_id: order.order.id,
        order_status: 'COMPLETED',
        payment_method: paymentMethod == 'default' ? undefined : paymentMethod,
        bank_vendor_id: bankTransfer
      }))
    )
  }

  return (
    <>
      <Box
        p={2}
        sx={{
          display: 'flex',
          gap: 2
        }}
      >
        <TextField
          size='small'
          sx={{
            width: '300px'
          }}
          value={orderNumber}
          placeholder='Ketik atau scan nomor pesanan disini'
          onChange={e => setOrderNumber(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleScan()
            }
          }}
        />
        <Button variant='contained' color='primary' onClick={handleScan} disabled={isLoading}>
          {t('Scan')}
        </Button>
        <Button variant='contained' color='error' onClick={handleReset}>
          {t('Reset')}
        </Button>
      </Box>
      <Dialog open={isShowErrorDialog} onClose={() => setIsShowErrorDialog(false)} title='Error'>
        <Box>{errorHtml}</Box>
      </Dialog>
      {ordersScanned.length > 0 && (
        <Dialog open={isSuccess} onClose={() => setIsSuccess(false)} title='Scan Checkout'>
          <Box>
            <Box>
              <Grid container>
                <Grid item xs={3}>
                  Nomor Pesanan
                </Grid>
                <Grid item xs={9}>
                  : {ordersScanned.map(order => order.order.order_number).join(', ')}
                </Grid>
                <Grid item xs={3}>
                  Pelanggan
                </Grid>
                <Grid item xs={9}>
                  : {ordersScanned[0].order.customer.name}
                </Grid>
              </Grid>
            </Box>
            <Box
              mt={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <CustomTextField
                disabled
                label='Sub Total'
                fullWidth
                sx={{
                  '& .MuiFormLabel-root': {
                    color: theme => `${theme.palette.text.primary} !important`
                  }
                }}
                value={formatPriceIDR(
                  ordersScanned.reduce((acc, order) => acc + order.order.grand_total, 0)
                )}
              />
              <Select
                isFloat={false}
                label={t('Payment Method')}
                options={[
                  { label: '--Pilih Metode Pembayaran--', value: 'default' },
                  { label: 'COD', value: 'CASH' },
                  { label: t('Bank Transfer'), value: 'BANK TRANSFER' }
                ]}
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as string)}
              />
              {paymentMethod == 'BANK TRANSFER' && (
                <SelectCustom
                  fullWidth
                  label={`${t('Select')} ${t('Bank')}`}
                  placeholder={`${t('Bank')}`}
                  options={bankTransferOptions}
                  optionKey={'value'}
                  labelKey={'label'}
                  value={bankTransfer}
                  onSelect={e => setBankTransfer(e?.value ?? undefined)}
                />
              )}
              <TextFieldNumber
                label={t('Global Discount')}
                fullWidth
                prefix='Rp '
                value={globalDiscount}
                onChange={value => setGlobalDiscount(value ?? 0)}
              />
              <CustomTextField
                disabled
                label='Grand Total'
                fullWidth
                sx={{
                  '& .MuiFormLabel-root': {
                    color: theme => `${theme.palette.text.primary} !important`
                  }
                }}
                value={formatPriceIDR(
                  ordersScanned.reduce((acc, order) => acc + order.order.grand_total, 0) -
                    globalDiscount
                )}
              />
            </Box>

            <Box
              mt={4}
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center'
              }}
            >
              <Button
                variant='contained'
                color='primary'
                disabled={isLoadingUpdateOrders}
                onClick={handleSubmit}
              >
                {t('Submit')}
              </Button>
              {/* <Button variant='contained' color='error'>
                {t('Cancel')}
              </Button> */}
            </Box>
          </Box>
        </Dialog>
      )}
    </>
  )
}

export default ScanOrder
