import { List, ListItem, InputLabel, Switch, InputAdornment, Button } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import {
  VendorStoreFeatureSettingData,
  VendorStoreFeatureSettingSchema
} from 'src/types/apps/vendor/setting'
import { yupResolver } from '@hookform/resolvers/yup'
import { vendorSettingService } from 'src/services/vendor/setting'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import SelectCustom from 'src/components/form/select/SelectCustom'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import { useApp } from 'src/hooks/useApp'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main
  },
  margin: 0
}))

const FeaturesComponent = () => {
  const { errorInput } = useApp()
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  const [cartExpired, setCartExpired] = useState<boolean>(true)
  const [orderExpired, setOrderExpired] = useState<boolean>(true)

  const [cartDay, setCartDay] = useState<number>(0)
  const [cartHour, setCartHour] = useState<number>(0)
  const [cartMinute, setCartMinute] = useState<number>(0)

  const [orderDay, setOrderDay] = useState<number>(0)
  const [orderHour, setOrderHour] = useState<number>(0)
  const [orderMinute, setOrderMinute] = useState<number>(0)

  const [reduceStockProduct, setReduceStockProduct] = useState<'TROLLEY' | 'CHECKOUT'>('TROLLEY')

  const [maximumOrderProductInCart, setMaximumOrderProductInCart] = useState<boolean>(false)
  const [maximumOrderQtyProductInCart, setMaximumOrderQtyProductInCart] = useState<boolean>(false)
  const [maximumTotalQtyOrderInCart, setMaximumTotalQtyOrderInCart] = useState<boolean>(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<VendorStoreFeatureSettingData>({
    defaultValues: {
      product_new_arrival_duration: 0,
      product_best_seller_duration: 0
    },
    mode: 'all',
    resolver: yupResolver(VendorStoreFeatureSettingSchema)
  })

  useQuery('productSetting', vendorSettingService.getVendorSetting, {
    onSuccess: data => {
      setValue('product_new_arrival_duration', data.data.data.product_new_arrival_duration)
      setValue('product_best_seller_duration', data.data.data.product_best_seller_duration)
      setValue('product_best_seller_quantity', data.data.data.product_best_seller_quantity)
      setValue('product_stock_status_limited', data.data.data.product_stock_status_limited)

      setValue('order_expired_in_minute', data.data.data.order_expired_in_minute)
      setValue('cart_item_expired_in_minute', data.data.data.cart_item_expired_in_minute)

      setValue('reduce_stock_product', data.data.data.reduce_stock_product)

      setReduceStockProduct(data.data.data.reduce_stock_product)

      setCartExpired(data.data.data.cart_item_expired_in_minute > 0)
      setOrderExpired(data.data.data.order_expired_in_minute > 0)

      setCartDay(Math.floor(data.data.data.cart_item_expired_in_minute / 60 / 24))
      setCartHour(Math.floor((data.data.data.cart_item_expired_in_minute / 60) % 24))
      setCartMinute(data.data.data.cart_item_expired_in_minute % 60)

      setOrderDay(Math.floor(data.data.data.order_expired_in_minute / 60 / 24))
      setOrderHour(Math.floor((data.data.data.order_expired_in_minute / 60) % 24))
      setOrderMinute(data.data.data.order_expired_in_minute % 60)

      onChangeMaximumOrderProductInCart(data.data.data.is_maximum_order_product_in_cart)
      onChangeMaximumOrderQtyProductInCart(data.data.data.is_maximum_order_qty_product_in_cart)
      onChangeMaximumTotalQtyOrderInCart(
        data.data.data.is_maximum_order_quantity_per_customer_in_cart
      )
    }
  })

  const { mutate: updateProductSetting } = useMutation(
    vendorSettingService.updateStoreFeatureSetting,
    {
      onSuccess: data => {
        toast.success(t((data as unknown as ResponseType).data.message))
      }
    }
  )

  const onSubmit = (data: VendorStoreFeatureSettingData) => {
    updateProductSetting({
      ...data,
      maximum_order_product_in_cart: maximumOrderProductInCart
        ? data.maximum_order_product_in_cart
        : undefined,
      maximum_order_qty_product_in_cart: maximumOrderQtyProductInCart
        ? data.maximum_order_qty_product_in_cart
        : undefined,
      maximum_order_quantity_per_customer_in_cart: maximumTotalQtyOrderInCart
        ? data.maximum_order_quantity_per_customer_in_cart
        : 0
    })
  }

  const onCartExpiredChange = (day: number, hour: number, minute: number) => {
    setValue('cart_item_expired_in_minute', day * 24 * 60 + hour * 60 + minute)
  }

  const onOrderExpiredChange = (day: number, hour: number, minute: number) => {
    setValue('order_expired_in_minute', day * 24 * 60 + hour * 60 + minute)
  }

  const onChangeMaximumOrderProductInCart = (value: boolean) => {
    setValue('is_maximum_order_product_in_cart', value)
    setMaximumOrderProductInCart(value)
  }

  const onChangeMaximumOrderQtyProductInCart = (value: boolean) => {
    setValue('is_maximum_order_qty_product_in_cart', value)
    setMaximumOrderQtyProductInCart(value)
  }

  const onChangeMaximumTotalQtyOrderInCart = (value: boolean) => {
    setValue('is_maximum_order_quantity_per_customer_in_cart', value)
    setMaximumTotalQtyOrderInCart(value)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {checkPermission('features.read') && (
          <>
            <List
              sx={{
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                '& .MuiListItem-root': {
                  display: 'grid',
                  gridTemplateColumns: 'min(280px) 1fr'
                }
              }}
            >
              <MuiListItem>
                <InputLabel>{t('Product New Arrival Duration')}</InputLabel>
                <Controller
                  control={control}
                  name='product_new_arrival_duration'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      {...field}
                      {...errorInput(errors, 'product_new_arrival_duration')}
                      min={0}
                      sx={{
                        width: 120,
                        ml: 2
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>{t('Days')}</InputAdornment>
                      }}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Product Best Seller Duration')}</InputLabel>
                <Controller
                  control={control}
                  name='product_best_seller_duration'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      {...field}
                      {...errorInput(errors, 'product_best_seller_duration')}
                      min={0}
                      sx={{
                        width: 120,
                        ml: 2
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>{t('Days')}</InputAdornment>
                      }}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Product Best Seller Quantity')}</InputLabel>
                <Controller
                  control={control}
                  name='product_best_seller_quantity'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      {...field}
                      error={Boolean(errors.product_best_seller_quantity)}
                      {...(errors.product_best_seller_quantity && {
                        helperText: errors.product_best_seller_quantity.message
                      })}
                      min={0}
                      sx={{
                        width: 120,
                        ml: 2
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>Pcs</InputAdornment>
                      }}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Product Stock Status Limited')}</InputLabel>
                <Controller
                  control={control}
                  name='product_stock_status_limited'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      {...field}
                      error={Boolean(errors.product_stock_status_limited)}
                      {...(errors.product_stock_status_limited && {
                        helperText: errors.product_stock_status_limited.message
                      })}
                      min={0}
                      sx={{
                        width: 120,
                        ml: 2
                      }}
                      size='small'
                      InputProps={{
                        endAdornment: <InputAdornment position='end'>Pcs</InputAdornment>
                      }}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Cart Expired')}</InputLabel>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 2
                  }}
                >
                  <MuiSwitch
                    checked={cartExpired}
                    onChange={e => {
                      setCartExpired(e.target.checked)
                    }}
                  />
                  {cartExpired && (
                    <>
                      <SelectCustom
                        value={cartDay}
                        label={t('Day') ?? 'Days'}
                        isFloating
                        options={[...Array(31).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setCartDay(value)
                          onCartExpiredChange(value, cartHour, cartMinute)
                        }}
                      />
                      <SelectCustom
                        value={cartHour}
                        label={t('Hour') ?? 'Hour'}
                        isFloating
                        options={[...Array(24).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setCartHour(value)
                          onCartExpiredChange(cartDay, value, cartMinute)
                        }}
                      />
                      <SelectCustom
                        value={cartMinute}
                        label={t('Minute') ?? 'Minute'}
                        isFloating
                        options={[...Array(60).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setCartMinute(value)
                          onCartExpiredChange(cartDay, cartHour, value)
                        }}
                      />
                    </>
                  )}
                </Box>
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Order Expired')}</InputLabel>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 2
                  }}
                >
                  <MuiSwitch
                    checked={orderExpired}
                    onChange={e => {
                      setOrderExpired(e.target.checked)
                    }}
                  />
                  {orderExpired && (
                    <>
                      <SelectCustom
                        value={orderDay}
                        label={t('Day') ?? 'Day'}
                        isFloating
                        options={[...Array(31).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setOrderDay(value)
                          onOrderExpiredChange(value, orderHour, orderMinute)
                        }}
                      />
                      <SelectCustom
                        value={orderHour}
                        label={t('Hour') ?? 'Hour'}
                        isFloating
                        options={[...Array(24).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setOrderHour(value)
                          onOrderExpiredChange(orderDay, value, orderMinute)
                        }}
                      />
                      <SelectCustom
                        value={orderMinute}
                        label={t('Minute') ?? 'Minute'}
                        isFloating
                        options={[...Array(60).keys()].map((item: number) => item)}
                        onSelect={value => {
                          setOrderMinute(value)
                          onOrderExpiredChange(orderDay, orderHour, value)
                        }}
                      />
                    </>
                  )}
                </Box>
              </MuiListItem>
              {/* <MuiListItem
            sx={{
              mt: 1,
              mb: 2
            }}
          >
            <InputLabel>Pemberitahuan Batas Stok</InputLabel>
            <TextField
              type='number'
              size={'small'}
              sx={{
                ml: 2
              }}
            />
          </MuiListItem> */}
              <MuiListItem>
                <InputLabel>{t('Stok Terpotong Ketika')}</InputLabel>
                <RadioButtonCustom
                  sx={{
                    ml: 3
                  }}
                  value={reduceStockProduct}
                  options={[
                    { value: 'TROLLEY', label: t('Trolley') },
                    { value: 'CHECKOUT', label: t('Checkout') }
                  ]}
                  onChange={value => {
                    const valueOp = value.value as 'TROLLEY' | 'CHECKOUT'
                    setValue('reduce_stock_product', valueOp)
                    setReduceStockProduct(valueOp)
                  }}
                />
              </MuiListItem>
              {/* <MuiListItem>
            <InputLabel>Global Diskon</InputLabel>
            <MuiSwitch />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>Penyesuaian</InputLabel>
            <MuiSwitch />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>Fungsi Penyesuaian</InputLabel>
            <RadioButtonCustom
              sx={{
                ml: 3
              }}
              options={[
                { value: 'menambah', label: 'Menambah Nilai' },
                { value: 'mengurangi', label: 'Mengurangi Nilai' }
              ]}
            />
          </MuiListItem> */}
              {/* <MuiListItem>
                <InputLabel>{t('Maximum Order Qty Product In Cart')}</InputLabel>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 2
                  }}
                >
                  <MuiSwitch
                    checked={maximumOrderProductInCart}
                    onChange={e => {
                      onChangeMaximumOrderProductInCart(e.target.checked)
                    }}
                  />
                  {maximumOrderProductInCart && (
                    <>
                      <Controller
                        control={control}
                        name='maximum_order_product_in_cart'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            isFloat
                            label={t('Bulk Update Max Order')}
                            {...field}
                            error={Boolean(errors.maximum_order_product_in_cart)}
                            {...(errors.maximum_order_product_in_cart && {
                              helperText: errors.maximum_order_product_in_cart.message
                            })}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Maximum Order Product in Cart')}</InputLabel>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 2
                  }}
                >
                  <MuiSwitch
                    checked={maximumOrderQtyProductInCart}
                    onChange={e => {
                      onChangeMaximumOrderQtyProductInCart(e.target.checked)
                    }}
                  />
                  {maximumOrderQtyProductInCart && (
                    <>
                      <Controller
                        control={control}
                        name='maximum_order_qty_product_in_cart'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            {...field}
                            isFloat
                            label={t('Bulk Update Max Order')}
                            error={Boolean(errors.maximum_order_qty_product_in_cart)}
                            {...(errors.maximum_order_qty_product_in_cart && {
                              helperText: errors.maximum_order_qty_product_in_cart.message
                            })}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('Maximum Total Qty In Cart')}</InputLabel>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: 2
                  }}
                >
                  <MuiSwitch
                    checked={maximumTotalQtyOrderInCart}
                    onChange={e => {
                      onChangeMaximumTotalQtyOrderInCart(e.target.checked)
                    }}
                  />
                  {maximumTotalQtyOrderInCart && (
                    <>
                      <Controller
                        control={control}
                        name='maximum_order_quantity_per_customer_in_cart'
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextFieldNumber
                            isFloat
                            label={t('Bulk Update Max Order')}
                            {...field}
                            error={Boolean(errors.maximum_order_quantity_per_customer_in_cart)}
                            {...(errors.maximum_order_quantity_per_customer_in_cart && {
                              helperText: errors.maximum_order_quantity_per_customer_in_cart.message
                            })}
                            sx={{
                              width: 200,
                              ml: 2
                            }}
                            size='small'
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </MuiListItem> */}
            </List>
            {checkPermission('features.update') && (
              <List
                sx={{
                  padding: 0,
                  margin: 0,
                  '& .MuiListItem-root': {
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: 'min(280px) 1fr',
                    padding: 0,
                    margin: 0
                  }
                }}
              >
                <Box>
                  <Button type='submit' variant='contained'>
                    {t('Save')}
                  </Button>
                </Box>
              </List>
            )}
          </>
        )}
      </Box>
    </form>
  )
}
export default FeaturesComponent
