import { Box, Button, Card, Divider, Grid, TextField, Typography, styled } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { Icon } from '@iconify/react'
import { InputTextArea } from 'src/components/form/InputTextArea'
import OrderItem, { InvoiceType } from './OrderItem'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import Link from 'next/link'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { useTranslation } from 'react-i18next'
import PickerDate from 'src/components/form/datepicker/PickerDate'
import {
  OrderEditData,
  OrderFullDetailType,
  orderPaymentStatusArray,
  orderSchema,
  orderStatusArray
} from 'src/types/apps/order'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { addHours } from 'date-fns'
import { BankVendorType } from 'src/types/apps/vendor/BankVendorType'
import { CourierType } from 'src/types/apps/vendor/courier'
import { ExpeditionType } from 'src/types/apps/vendor/expedition'
import { CustomerType } from 'src/types/apps/customerType'
import { orderService } from 'src/services/order'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { UnitType } from 'src/types/apps/unitType'
import { OutletType } from 'src/types/apps/outlet/outlet'
import { useApp } from 'src/hooks/useApp'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { ResponseType } from 'src/types/response/response'
import { customerAddressService } from 'src/services/customerAddress'
import { CustomerAddressType } from 'src/types/apps/customerAddressType'
import { SubDistrictDetailType, SubDistrictRequestType } from 'src/types/apps/locationType'
import { locationService } from 'src/services/location'
import { MetaType } from 'src/types/pagination/meta'
import FormCustomerAddressDialog from 'src/pages/customer/data/components/dialogs/FormCustomerAddressDialog'
import { promise } from 'src/utils/promise'
import DialogRajaOngkir from './DialogRajaOngkir'
import { vendorSettingService } from 'src/services/vendor/setting'
import { CodSettingType } from 'src/types/apps/vendor/settings/shipping'
import { PaymentMethodNonCashType } from 'src/types/apps/vendor/PaymentMethodNonCash'

type FormOrderProps = {
  data?: OrderFullDetailType
  productsOld?: InvoiceType[]
  outlet: OutletType[]
  vendorNonCash: PaymentMethodNonCashType[]
  vendorBank: BankVendorType[]
  courierRajaOngkir: ExpeditionType[]
  courierManual: CourierType[]
  customer: CustomerType[]
  units: UnitType[]
  cod: CodSettingType
}

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '20px' }
}))

const FormOrder = ({
  data,
  productsOld,
  outlet,
  vendorBank,
  vendorNonCash,
  courierRajaOngkir,
  customer,
  units,
  cod
}: FormOrderProps) => {
  // Hooks
  const { errorInput, translateFormYupMsg } = useApp()
  const { t } = useTranslation()
  const { setButtonRight } = useAppBarButton()
  const queryClient = useQueryClient()
  const router = useRouter()

  // const [deleteProduct, setDeleteProduct] = useState<number[]>([])

  // dialog
  const [isOpenDialogCustomerAddress, setIsOpenDialogCustomerAddress] = useState(false)

  const openDialogCustomerAddress = () => {
    setIsOpenDialogCustomerAddress(true)
  }

  const closeDialogCustomerAddress = () => {
    setIsOpenDialogCustomerAddress(false)
  }

  const [rajaOngkirDialogData, setRajaOngkirDialogData] = useState<
    | {
        weight: number
        subdistrict_id: number
        shippingName: string
      }
    | undefined
  >(undefined)

  const [isOpenDialogRajaOngkir, setIsOpenDialogRajaOngkir] = useState(false)

  const handleOpenDialogRajaOngkir = () => {
    const shippingType = getValues().shipping_type

    if (totalWeight && customerAddressSelected?.subdistrict_id && shippingType && courierId) {
      const weight = totalWeight
      const subdistrict_id = customerAddressSelected?.subdistrict_id
      let shippingName: string | undefined = undefined

      if (shippingType == 'COURIER RAJA ONGKIR') {
        shippingName = courierRajaOngkir.find(item => item.id == courierId)?.name
      }

      if (shippingName) {
        setIsOpenDialogRajaOngkir(true)
        setRajaOngkirDialogData({ weight, subdistrict_id, shippingName })
      }
    }
  }

  const handleCloseDialogRajaOngkir = () => {
    setIsOpenDialogRajaOngkir(false)
    setRajaOngkirDialogData(undefined)
  }

  // customer data
  const [customerAddress, setCustomerAddress] = useState<CustomerAddressType[]>([])
  const [customerAddressSelected, setCustomerAddressSelected] = useState<
    CustomerAddressType | undefined
  >(undefined)
  const [membershipLevel, setMembershipLevel] = useState<number | undefined>(undefined)

  const [courier, setCourier] = useState<string | undefined>(
    data
      ? data.order.shipping_type == 'SELFPICKUP'
        ? 'SELFPICKUP'
        : `${data.order.shipping_type}-${
            courierRajaOngkir.find(item => item.name == data.order.shipping.name)?.name
          }`
      : 'SELFPICKUP'
  )
  const [courierId, setCourierId] = useState<number | undefined>(
    data
      ? data.order.shipping_type != 'SELFPICKUP'
        ? courierRajaOngkir.find(item => item.name == data.order.shipping.name)?.id
        : undefined
      : undefined
  )

  const [products, setProducts] = useState<InvoiceType[]>(productsOld ?? [])
  const [globalDiscount, setGlobalDiscount] = useState(data ? data.order.global_discount ?? 0 : 0)
  const [shippingCost, setShippingCost] = useState(data ? data.order.shipping_cost ?? 0 : 0)
  const [shippingTax, setShippingTax] = useState(data ? data.order.shipping_tax ?? 0 : 0)
  const [subTotal, setSubTotal] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  const [dateValue, setDateValue] = useState<DateType>(
    data ? addHours(new Date(data.order.created_at), -7) : new Date()
  )

  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(
    data
      ? data.order.payment_method == 'CASH'
        ? 'CASH'
        : `${data.order.payment_method}-${data.order.payment_method_id}`
      : 'CASH'
  )

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors }
  } = useForm<OrderEditData>({
    resolver: yupResolver(orderSchema),
    mode: 'all',
    defaultValues: {
      order_type: 'REGULAR',
      order_date: data ? new Date(data.order.created_at) : new Date(),
      outlet_id: data
        ? outlet.find(item => item.id == data.order.outlet_id)?.id
        : outlet.length == 1
        ? outlet[0].id
        : undefined,
      customer_id: data ? data.order.customer_id : undefined,
      global_discount: data ? data.order.global_discount ?? 0 : 0,
      order_number: data ? data.order.order_number : '',
      payment_method: data ? data.order.payment_method : 'CASH',
      payment_method_id: data ? data.order.payment_method_id : null,
      cod_payment_name: data ? data.order.cod_payment?.name : null,
      cod_payment_logo: data ? data.order.cod_payment?.logo : null,
      payment_status: data ? data.order.payment_status : 'unpaid',
      shipping_cost: data ? data.order.shipping_cost : 0,
      shipping_tax: data ? data.order.shipping_tax : 0,
      shipping_type: data ? data.order.shipping_type : 'SELFPICKUP',
      order_status: data ? data.order.order_status : 'UNPAID',
      customer_address_id: data ? data.order.customer_address_id : null,
      shipping_detail: data ? data.order.shipping : undefined,
      order_payments: data ? data.order_payments ?? [] : []
    }
  })

  const [shippingTaxActice, setShippingTaxActive] = useState(
    data ? data.order.shipping_tax && data.order.shipping_tax > 0 : false
  )
  const [shippingTaxPerKg, setShippingTaxPerKg] = useState(0)

  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setShippingTaxActive(data.data.data.is_shipping_tax_by_weight_checkout_active)
      setShippingTaxPerKg(data.data.data.shipping_tax_by_weight)
    },
    enabled: Boolean(!data)
  })

  // query
  useQuery(['customer-address-list', getValues().customer_id], {
    queryFn: () => customerAddressService.getListByCustomerId(getValues().customer_id ?? 0),
    enabled: Boolean(
      getValues().customer_id != undefined &&
        getValues().shipping_type &&
        getValues().shipping_type != 'SELFPICKUP'
    ),
    onSuccess: response => {
      setCustomerAddress(response?.data?.data ?? [])
      if (response.data.data.length == 1) {
        setValue('customer_address_id', response.data.data[0].id)
      }

      if (data && data.order.customer_address) {
        promise(() => {
          setCustomerAddressSelected(data.order.customer_address)
        }, 100)
      }
    }
  })

  const [paginationData, setPaginationData] = useState<SubDistrictRequestType>({
    limit: 100,
    page: 1,
    query: '',
    order: 'id',
    sort: 'asc'
  })

  const [selectLocation, setSelectLocation] = useState<SubDistrictDetailType | null>(null)
  const [locationData, setLocationData] = useState<SubDistrictDetailType[]>([])
  const [, setLocationMeta] = useState<MetaType>()

  useQuery(['location-list', paginationData], {
    queryFn: () => locationService.getSubDistrict(paginationData),
    onSuccess: data => {
      setLocationData(data.data.data)
      setLocationMeta(data.data.meta)
    }
  })

  useQuery(['get-one-sub-disctrict', customerAddressSelected?.id], {
    queryFn: () => locationService.getOneSubDistrict(customerAddressSelected?.subdistrict_id ?? 0),
    onSuccess: data => {
      setLocationData(
        [data.data.data].map(item => ({
          ...item,
          subdistrict_name: `${item.subdistrict_name}, ${item.district_name}, ${item.province_name}`
        }))
      )

      promise(() => {
        setSelectLocation(data.data.data)
      }, 100)
    },
    enabled: Boolean(customerAddressSelected?.id)
  })

  // mutation

  const createOrderMutation = useMutation(orderService.create, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('supplier-list')

      router.push('/order')
    }
  })
  const updateOrderMutation = useMutation(orderService.update, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('supplier-list')

      router.push('/order')
    }
  })

  const onSubmit = (dataUpdate: OrderEditData) => {
    console.log('debug', dataUpdate)

    if (getValues().shipping_type != 'SELFPICKUP') {
      if (!getValues().customer_address_id) {
        setError('customer_address_id', {
          type: 'required',
          message: 'Customer Address is required'
        })

        return
      }

      if (!getValues().shipping_detail) {
        setError('shipping_detail', {
          type: 'required',
          message: 'Shipping Service is required'
        })

        return
      }
    }

    if (data) {
      updateOrderMutation.mutate({ id: data.order.id, data: dataUpdate })
    } else {
      createOrderMutation.mutate(dataUpdate)
    }
  }

  useEffect(() => {
    setValue(
      'order_items',
      [
        ...products.map(item => ({
          product_id: item.product.product.id,
          product_variant_id: item.variant_id ?? null,
          quantity: item.qty,
          price: item.price,
          discount_per_item: item.discount ?? 0
        }))
      ],
      {
        shouldValidate: products.length > 0
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  useEffect(() => {
    if (grandTotal < 0) {
      setGlobalDiscount(globalDiscount + grandTotal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grandTotal])

  useEffect(() => {
    setValue('sub_total', subTotal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal])

  useEffect(() => {
    console.log('xdebug products', products)

    setSubTotal(
      products.reduce((acc, item) => acc + (item.total - item.qty * (item.discount ?? 0)), 0)
    )
    setTotalWeight(products.reduce((acc, item) => acc + item.product.product.weight * item.qty, 0))
    setGrandTotal(
      products.reduce((acc, item) => acc + (item.total - item.qty * (item.discount ?? 0)), 0) -
        globalDiscount +
        shippingCost +
        shippingTax
    )
  }, [globalDiscount, shippingCost, shippingTax, products])

  const deleteAllProduct = () => {
    // const productIds = products
    //   .filter(item => item.id != undefined)
    //   .map(item => item.id) as number[]

    // setDeleteProduct(old => [...old, ...productIds])

    setProducts([])
  }

  useEffect(() => {
    const orderStatus = watch((value, { name, type }) => {
      if (name == 'order_status' && type == 'change') {
        setValue(
          'payment_status',
          value.order_status == 'CANCELED'
            ? 'cancelled'
            : value.order_status == 'UNPAID'
            ? 'pending'
            : 'paid'
        )
      }

      if (name == 'customer_id' && type == 'change') {
        setCustomerAddressSelected(undefined)
        setCustomerAddress([])

        const customerSelected = getValues().customer_id
          ? customer.find(item => item.id == getValues().customer_id.toString())
          : undefined

        if (customerSelected) {
          setMembershipLevel(customerSelected.membership_level)
        }
      }

      if (name == 'global_discount' && type == 'change') {
        setGlobalDiscount(value.global_discount ?? 0)
      }

      if (name == 'shipping_cost' && type == 'change') {
        setShippingCost(value.shipping_cost ?? 0)
      }

      if (name == 'shipping_tax' && type == 'change') {
        setShippingTax(value.shipping_tax ?? 0)
      }
    })

    return () => orderStatus.unsubscribe()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch])

  useEffect(() => {
    setButtonRight(
      <>
        <Link href='/order'>
          <Button variant='outlined' size='small' startIcon={<Icon icon='mdi:arrow-left' />}>
            Cancel
          </Button>
        </Link>
        <Button
          variant='contained'
          size='small'
          startIcon={<Icon icon='ic:round-save' />}
          onClick={() => {
            handleSubmit(onSubmit)()
          }}
        >
          Save
        </Button>
      </>
    )

    return () => {
      setButtonRight(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // effect setValue
  useEffect(() => {
    setValue('order_date', addHours(dateValue as Date, 7))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue])

  useEffect(() => {
    if (shippingTaxActice && courierId) {
      // pembulatan ke atas
      const shippingTax = Math.ceil(totalWeight / 1000) * shippingTaxPerKg

      setValue('shipping_tax', shippingTax)
    } else {
      setValue('shipping_tax', 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWeight, shippingTaxActice, courierId])

  console.log('xdebug error', errors)

  return (
    <div>
      <CardWrapper>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} columns={10}>
              <Grid item xs={12} sm={2}>
                <PickerDate
                  label={t('Order Date') ?? 'Order Date'}
                  value={dateValue}
                  onSelectDate={date => setDateValue(date)}
                  {...errorInput(errors, 'order_date')}
                />
              </Grid>
              {outlet.length > 1 && (
                <Grid item xs={12} sm={2}>
                  <Controller
                    control={control}
                    name='outlet_id'
                    render={({ field }) => (
                      <SelectCustom
                        value={field.value}
                        onSelect={value => field.onChange(value?.value ?? undefined)}
                        options={outlet.map(item => ({
                          label: item.name,
                          value: item.id
                        }))}
                        labelKey={'label'}
                        optionKey={'value'}
                        label={t('Outlet') ?? 'Outlet'}
                        isFloating
                        {...errorInput(errors, 'outlet_id')}
                      />
                    )}
                  />
                </Grid>
              )}
              {data && (
                <Grid item xs={12} sm={2}>
                  <Controller
                    control={control}
                    name='order_number'
                    render={({ field }) => (
                      <TextField
                        size='small'
                        fullWidth
                        {...field}
                        label={t('Order Number') ?? 'Order Number'}
                        {...errorInput(errors, 'order_number')}
                      />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={2}>
                <Controller
                  control={control}
                  name='order_status'
                  render={({ field }) => (
                    <SelectCustom
                      value={field.value}
                      onSelect={value => field.onChange(value?.value ?? undefined)}
                      options={orderStatusArray.map(item => ({
                        label: t(item),
                        value: item
                      }))}
                      labelKey={'label'}
                      optionKey={'value'}
                      label={t('Order Status') ?? 'Order Status'}
                      isFloating
                      {...errorInput(errors, 'order_status')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <SelectCustom
                  value={paymentMethod}
                  onSelect={value => {
                    setPaymentMethod(value?.value ?? undefined)
                    console.log('xdebug payment', value)

                    if (value?.value == 'CASH') {
                      setValue('payment_method', 'CASH')
                      setValue('payment_method_id', null)
                      setValue('cod_payment_name', null)
                      setValue('cod_payment_logo', null)
                      setValue('order_payments', [
                        {
                          ref_no: '',
                          trace_no: '',
                          payment_method: 'CASH',
                          payment_method_id: null
                        }
                      ])
                    } else if (value?.value == 'COD') {
                      setValue('payment_method', 'CASH')
                      setValue('payment_method_id', null)
                      setValue('cod_payment_name', cod.name)
                      setValue('cod_payment_logo', cod.logo)
                      setValue('order_payments', [
                        {
                          ref_no: '',
                          trace_no: '',
                          payment_method: 'COD',
                          payment_method_id: null
                        }
                      ])
                    } else if (value?.value) {
                      const paymentMethod = value?.value.split('-')[0]
                      const paymentMethodId = value?.value.split('-')[1]

                      if (paymentMethod && paymentMethodId) {
                        setValue('payment_method', paymentMethod)
                        setValue('payment_method_id', paymentMethodId)
                        setValue('cod_payment_name', null)
                        setValue('cod_payment_logo', null)

                        setValue('order_payments', [
                          {
                            ref_no: '',
                            trace_no: '',
                            payment_method: paymentMethod,
                            payment_method_id: paymentMethodId
                          }
                        ])
                      }
                    } else if (value?.value == null) {
                      setValue('payment_method', '')
                      setValue('payment_method_id', null)
                      setValue('order_payments', [])
                    }
                  }}
                  options={[
                    { label: t('Cash'), value: 'CASH' },
                    ...(cod.is_active || data?.order.cod_payment
                      ? [{ label: t('COD'), value: 'COD' }]
                      : []),
                    ...vendorBank.map(item => ({
                      label: item.bank_name,
                      value: 'BANK TRANSFER-' + item.id,
                      group: 'BANK TRANSFER'
                    })),
                    ...vendorNonCash.map(item => ({
                      label: item.payment_name,
                      value:
                        (item.payment_type == 'EDC'
                          ? 'DEBIT CARD'
                          : item.payment_type == 'EWALLET'
                          ? 'EWALLET'
                          : 'NON CASH') +
                        '-' +
                        item.id,
                      group:
                        item.payment_type == 'EDC'
                          ? 'DEBIT CARD'
                          : item.payment_type == 'EWALLET'
                          ? 'EWALLET'
                          : 'NON CASH'
                    }))
                  ]}
                  labelKey={'label'}
                  optionKey={'value'}
                  label={t('Payment Method') ?? 'Payment Method'}
                  groupBy={option => t(option.group)}
                  isFloating
                  {...errorInput(errors, 'payment_method')}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Controller
                  control={control}
                  name='payment_status'
                  render={({ field }) => (
                    <SelectCustom
                      value={field.value}
                      options={orderPaymentStatusArray.map(item => ({
                        label: t(item),
                        value: item
                      }))}
                      onSelect={value => field.onChange(value?.value ?? undefined)}
                      labelKey={'label'}
                      optionKey={'value'}
                      label={t('Payment Status') ?? 'Payment Status'}
                      isFloating
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <SelectCustom
                  value={courier}
                  onSelect={value => {
                    setCourier(value?.value ?? undefined)
                    if (value?.value == 'SELFPICKUP') {
                      setValue('shipping_type', 'SELFPICKUP')
                      setValue('customer_address_id', null)
                      setValue('shipping_detail', null)
                      setCustomerAddressSelected(undefined)
                      setCustomerAddress([])
                      setCourierId(undefined)
                    } else if (value?.value) {
                      setValue('shipping_type', 'COURIER RAJA ONGKIR')

                      const shipping = courierRajaOngkir.find(
                        item => item.name == value?.value.split('-')[1]
                      )

                      if (shipping) {
                        setCourierId(shipping.id)
                      }
                    } else if (value?.value == null) {
                      setValue('shipping_type', value?.value ?? undefined)
                      setValue('customer_address_id', null)
                      setValue('shipping_detail', null)
                      setCustomerAddressSelected(undefined)
                      setCustomerAddress([])
                      setCourierId(undefined)
                    }
                  }}
                  options={[
                    { label: t('Self Pickup'), value: 'SELFPICKUP' },
                    ...courierRajaOngkir.map(item => ({
                      label: item.name,
                      value: 'COURIER RAJA ONGKIR-' + item.name
                    }))
                    // ...courierManual.map(item => ({
                    //   label: t('Courier Manual') + ' ' + item.name,
                    //   value: 'COURIER MANUAL-' + item.id
                    // }))
                  ]}
                  labelKey={'label'}
                  optionKey={'value'}
                  label={t('Logistic Method') ?? 'Logistic Method'}
                  isFloating
                  {...errorInput(errors, 'shipping_type')}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Controller
                  control={control}
                  name='customer_id'
                  render={({ field }) => (
                    <SelectCustom
                      value={field.value}
                      onSelect={value => field.onChange(value?.value ?? undefined)}
                      options={customer.map(item => ({
                        label: item.name,
                        value: item.id
                      }))}
                      labelKey={'label'}
                      optionKey={'value'}
                      label={t('Customer') ?? 'Customer'}
                      isFloating
                      {...errorInput(errors, 'customer_id')}
                    />
                  )}
                />
              </Grid>
              {getValues().shipping_type && getValues().shipping_type != 'SELFPICKUP' && (
                <>
                  <Grid item xs={12} sm={2}>
                    <Controller
                      control={control}
                      name='customer_address_id'
                      render={({ field }) => (
                        <SelectCustom
                          disabled={getValues().customer_id == undefined}
                          value={customerAddressSelected?.id ?? null}
                          onSelect={value => {
                            field.onChange(value?.value ?? undefined)
                            setCustomerAddressSelected(
                              customerAddress.find(item => item.id == value?.value) ?? undefined
                            )
                          }}
                          options={customerAddress.map(item => ({
                            label: item.name,
                            value: item.id
                          }))}
                          labelKey={'label'}
                          optionKey={'value'}
                          label={t('Customer Address Saved') ?? 'Customer Address Saved'}
                          isFloating
                          onAddButton={openDialogCustomerAddress}
                          {...errorInput(errors, 'customer_address_id')}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
              {customerAddressSelected && (
                <Grid container item xs={12} spacing={2} columns={10}>
                  <Grid item sm={12}>
                    <Divider />
                    <Typography variant='body1' mb={2} mt={2}>
                      {t('Customer Address')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      size='small'
                      fullWidth
                      label={t('Recipient Name') ?? 'Recipient Name'}
                      value={customerAddressSelected?.name}
                      disabled={customerAddressSelected == undefined}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      size='small'
                      fullWidth
                      label={t('Recipient Phone') ?? 'Recipient Phone'}
                      value={customerAddressSelected?.phone}
                      disabled={customerAddressSelected == undefined}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <SelectCustom
                      serverSide
                      value={selectLocation?.id}
                      isFloating
                      options={locationData ?? []}
                      optionKey='id'
                      onSelect={(data: SubDistrictDetailType) => {
                        setSelectLocation(data)
                        // setValue('subdistrict_id', value, {
                        //   shouldValidate: true,
                        //   shouldDirty: true
                        // })
                      }}
                      label={t('Location') ?? 'Location'}
                      labelKey='subdistrict_name'
                      onInputChange={(event, newInputValue) => {
                        if (newInputValue && event?.type === 'change') {
                          const valueSelection = locationData?.find(
                            item => item.subdistrict_name == newInputValue
                          )

                          if (valueSelection) return
                          setPaginationData({
                            limit: paginationData.limit,
                            page: 1,
                            query: newInputValue,
                            order: paginationData.order,
                            sort: paginationData.sort
                          })
                        }
                      }}
                      renderLabel={options => {
                        if (!options) return ''

                        return (
                          options.subdistrict_name +
                          ', ' +
                          options.district_name +
                          ', ' +
                          options.province_name
                        )
                      }}
                      {...errorInput(errors, 'subdistrict_id')}
                      disabled={customerAddressSelected == undefined}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      size='small'
                      fullWidth
                      label={t('Postal Code') ?? 'Postal Code'}
                      value={customerAddressSelected?.postal_code}
                      disabled={customerAddressSelected == undefined}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputTextArea
                      placeholder='Address'
                      minRows={3}
                      value={customerAddressSelected?.address}
                      disabled={customerAddressSelected == undefined}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid
                py={2}
                item
                borderRadius={1}
                sx={theme => ({
                  backgroundColor: theme.palette.customColors.tableHeaderBg,
                  borderColor: theme.palette.divider,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  marginBottom: 2,
                  '& .MuiGrid-item': {
                    paddingLeft: 1
                  }
                })}
                container
                alignItems={'center'}
                columns={20}
                columnSpacing={3}
              >
                <Grid item xs={2.4} px={2} display={'flex'} spacing={2} alignItems={'center'}>
                  <Icon
                    style={{
                      cursor: 'pointer'
                    }}
                    icon='ph:minus-fill'
                    fontSize={18}
                    color='red'
                    onClick={deleteAllProduct}
                  />
                  <Box ml={2}>MSKU/VSKU</Box>
                </Grid>
                <Grid item xs={5.4}>
                  {t('Product Name')}
                </Grid>
                <Grid item xs={1.8}>
                  {t('Variant')}
                </Grid>
                <Grid item xs={1.5}>
                  Qty
                </Grid>
                <Grid item xs={1.5}>
                  Unit
                </Grid>
                <Grid item xs={2.2}>
                  @{t('Price')}
                </Grid>
                <Grid item xs={2.2}>
                  @{t('Discount')}
                </Grid>
                <Grid item xs={3}>
                  Total
                </Grid>
              </Grid>
              <Grid item container rowSpacing={1}>
                {[...Array(products.length + 1).keys()].map((item, index) => (
                  <OrderItem
                    key={index}
                    index={index}
                    products={products}
                    unitData={units}
                    product={products[index]}
                    membershipLevel={membershipLevel}
                    setProductInvoice={data => {
                      if (products.length == index && data) {
                        setProducts(old => [...old, data])
                      } else {
                        if (data) {
                          setProducts(old => {
                            old[index] = data

                            return [...old]
                          })
                        } else {
                          setProducts(old => {
                            old.splice(index, 1)

                            return [...old]
                          })
                        }
                      }
                    }}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {errors.order_items && (
          <Typography color='error'>{translateFormYupMsg(errors.order_items.message)}</Typography>
        )}
        <Grid mt={2} container columnSpacing={3}>
          <Grid item xs={6}>
            <InputTextArea minRows={10} placeholder='Note' />
          </Grid>
          <Grid item xs={6} container columnSpacing={3} rowSpacing={2} alignItems={'center'}>
            <Grid item xs={6}>
              <Typography>
                {t('Total Weight')} ({products.length} Item)
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextFieldNumber
                disabled
                size='small'
                fullWidth
                value={totalWeight}
                onChange={value => setTotalWeight(value ?? 0)}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>Sub Total</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextFieldNumber
                size='small'
                fullWidth
                value={subTotal}
                disabled
                prefix='Rp '
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>{t('Global Discount')}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name='global_discount'
                render={({ field }) => (
                  <TextFieldNumber
                    min={0}
                    max={subTotal}
                    value={field.value}
                    onChange={value => {
                      if (value != undefined) {
                        field.onChange(value)
                      } else {
                        field.onChange(0)
                      }
                    }}
                    size='small'
                    fullWidth
                    prefix='-Rp '
                    InputProps={{
                      inputProps: {
                        min: 0
                      }
                    }}
                    {...errorInput(errors, 'global_discount')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Box
                onClick={handleOpenDialogRajaOngkir}
                {...(totalWeight &&
                customerAddressSelected?.subdistrict_id &&
                getValues().shipping_type &&
                courierId
                  ? {
                      sx: {
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: 'primary.main'
                      }
                    }
                  : {})}
              >
                {t('Shipping Fee')}
              </Box>
              <Typography color='error'>
                {translateFormYupMsg(errors.shipping_detail?.message)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name='shipping_cost'
                render={({ field }) => (
                  <TextFieldNumber
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    size='small'
                    fullWidth
                    prefix='Rp '
                    InputProps={{
                      inputProps: {
                        min: 0
                      }
                    }}
                    {...errorInput(errors, 'shipping_cost')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>{t('Shipping Tax')}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                control={control}
                name='shipping_tax'
                render={({ field }) => (
                  <TextFieldNumber
                    disabled
                    value={field.value}
                    onChange={value => field.onChange(value)}
                    size='small'
                    fullWidth
                    prefix='Rp '
                    InputProps={{
                      inputProps: {
                        min: 0
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <hr />
            </Grid>
            <Grid item xs={6}>
              <Typography>Grand Total</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextFieldNumber
                size='small'
                fullWidth
                value={grandTotal}
                disabled
                prefix='Rp '
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </CardWrapper>
      {getValues().customer_id && (
        <FormCustomerAddressDialog
          open={isOpenDialogCustomerAddress}
          toggle={closeDialogCustomerAddress}
          customerId={getValues().customer_id}
        />
      )}
      {rajaOngkirDialogData && (
        <DialogRajaOngkir
          open={isOpenDialogRajaOngkir}
          toggle={handleCloseDialogRajaOngkir}
          subdistrict_id={rajaOngkirDialogData.subdistrict_id}
          weight={rajaOngkirDialogData.weight}
          onSelected={data => {
            setValue('shipping_cost', data.price)
            setValue('shipping_detail', data, {
              shouldValidate: true,
              shouldDirty: true
            })
          }}
          shippingName={rajaOngkirDialogData.shippingName}
        />
      )}
    </div>
  )
}

export default FormOrder
