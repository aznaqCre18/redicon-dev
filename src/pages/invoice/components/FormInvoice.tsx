import { Box, Button, Card, Grid, TextField, Typography, styled } from '@mui/material'
import React, { useEffect, useState } from 'react'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { Icon } from '@iconify/react'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import Link from 'next/link'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import FormItemInvoice, { InvoiceType } from './FormItemInvoice'
import { promise } from 'src/utils/promise'
import FormDialogSupplier from 'src/pages/purchase/supplier/components/FormDialogSupplier'
import {
  SaleData,
  SaleDataUpdate,
  SaleSchema,
  SaleUpdateSchema,
  SaleDetailType
} from 'src/types/apps/sale/sale'
import { CustomerType } from 'src/types/apps/customerType'
import { customerService } from 'src/services/customer'
import { saleService } from 'src/services/sale/sale'
import { productService } from 'src/services/product'
import { addHours } from 'date-fns'
import { UnitType } from 'src/types/apps/unitType'
import { unitService } from 'src/services/unit'
import { useApp } from 'src/hooks/useApp'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import PickerDate from 'src/components/form/datepicker/PickerDate'

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '20px' }
}))

const FormInvoice = ({
  data: dataOld,
  isReturn = false
}: {
  data?: SaleDetailType
  isReturn?: boolean
}) => {
  const { errorInput, translateFormYupMsg } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isLoadingDataOld, setIsLoadingDataOld] = useState(false)

  const [formCustomerAddOpen, setFormCustomerAddOpen] = useState(false)

  const handleCloseFormCustomerDialog = () => {
    setFormCustomerAddOpen(false)
  }

  // useAppBarButton
  const { setButtonRight } = useAppBarButton()

  const [deleteProduct, setDeleteProduct] = useState<number[]>([])

  const [outlet, setOutlet] = useState<number | undefined>(undefined)
  const [outletData, setOutletData] = useState<any[]>([])
  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data)

      if (dataOld) {
        promise(() => {
          setOutlet(dataOld.sales.outlet_id)
        }, 200)
      } else if (data.data.data.length == 1) {
        setValue('outlet_id', data.data.data[0].id)
      }
    }
  })

  const [customer, setCustomer] = useState<number | undefined>(undefined)
  const [membershipLevel, setMembershipLevel] = useState<number>(1)
  const [customerData, setCustomerData] = useState<CustomerType[]>([])
  const getCustomer = useQuery('customer-list', {
    queryFn: () => customerService.getListCustomer(maxLimitPagination),
    onSuccess: data => {
      const _data = data.data.data ?? []
      setCustomerData(_data)

      if (dataOld) {
        _data.forEach(item => {
          if (item.id == dataOld.customer.id) {
            promise(() => {
              setCustomer(Number(item.id))
              setMembershipLevel(item.membership_level)
            }, 200)
          }
        })
      } else if (_data.length == 1) {
        setMembershipLevel(_data[0].membership_level)
        setValue('customer_id', Number(_data[0].id))
      }
    }
  })

  const [unitData, setUnitData] = useState<UnitType[]>([])
  const getUnits = useQuery('unit-list', {
    queryFn: () => unitService.getListUnit(maxLimitPagination),
    onSuccess: data => {
      setUnitData(data.data.data)
    }
  })

  const create = useMutation(saleService.create, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('customer-list')

      router.push('/invoice/data')
    }
  })

  const update = useMutation(saleService.update, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('customer-list')

      router.push('/invoice/data')
    }
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm<SaleData | SaleDataUpdate>({
    mode: 'all',
    defaultValues: {
      payment_method: 'TUNAI',
      order_id: ''
    },
    resolver: yupResolver(dataOld ? SaleUpdateSchema : SaleSchema)
  })

  const onSubmit = (dataNew: SaleData | SaleDataUpdate) => {
    const productHasVariant = products.filter(item => (item.product.variants ?? []).length > 0)
    console.log('debug', productHasVariant)
    console.log('debug', products)

    if (productHasVariant.length > 0) {
      const productHasVariantNotSelected = productHasVariant.filter(item => !item.variant_id)

      console.log('debug', productHasVariantNotSelected)

      if (productHasVariantNotSelected.length > 0) {
        toast.error(t('Variant product is required'))

        return
      }
    }

    if (dataOld) {
      const dataOldIds = dataOld.sales_details.map(item => item.id)
      const dataNewUpdate = dataNew as SaleDataUpdate
      // filter dataNew.purchase_items.id is not exist on dataOld.purchase_items.purchase_item_deleted and not have id
      // dataNewUpdate.purchase_items = dataNewUpdate.purchase_items.filter(
      //   (item: any) => !dataOldIds.includes(item.id)
      // )

      if (
        dataOldIds.length == dataNewUpdate.sales_item_deleted.length &&
        dataNewUpdate.sales_details.length == 0
      ) {
        toast.error('Please add new product or update product')

        return
      }

      if (!isReturn) {
        update.mutate({
          id: dataOld.sales.id.toString(),
          data: dataNew as SaleDataUpdate
        })
      } else {
        // updateReturn.mutate({
        //   id: dataOld.sales.id.toString(),
        //   data: dataNew as SaleDataUpdate
        // })
      }
    } else {
      if (!isReturn) create.mutate(dataNew)
      // else createReturn.mutate(dataNew)
    }
  }

  const [products, setProducts] = useState<InvoiceType[]>([])
  const [discount, setDiscount] = useState(0)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  const deleteAllProduct = () => {
    const productIds = products
      .filter(item => item.id != undefined)
      .map(item => item.id) as number[]

    setDeleteProduct(old => [...old, ...productIds])

    setProducts([])
  }

  // useEffect(() => {
  //   if (grandTotal < 0) {
  //     setGlobalDiscount(globalDiscount + grandTotal)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [grandTotal])

  useEffect(() => {
    setSubTotal(products.reduce((acc, item) => acc + item.total, 0))
    setTotalWeight(products.reduce((acc, item) => acc + item.product.product.weight * item.qty, 0))
    setDiscount(products.reduce((acc, item) => acc + item.qty * (item.discount ?? 0), 0))
    setGrandTotal(
      products.reduce((acc, item) => acc + (item.total - item.qty * (item.discount ?? 0)), 0) -
        globalDiscount
    )
  }, [globalDiscount, products])

  useEffect(() => {
    setValue(
      'sales_details',
      [
        ...products.map(item => ({
          id: item.id,
          name: item.product.product.name,
          product_id: item.product.product.id,
          product_variant_id: item.variant_id,
          qty: item.qty,
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
    setValue('global_discount', globalDiscount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDiscount])

  useEffect(() => {
    const deleteProductNotDuplicate = Array.from(new Set(deleteProduct))

    setValue('sales_item_deleted', deleteProductNotDuplicate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteProduct])

  const [dateValue, setDateValue] = useState<DateType>(new Date())

  useEffect(() => {
    if (dateValue) setValue('created_at', addHours(dateValue as Date, 7).toISOString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue])

  // const generateInvoiceId = () => {
  //   setValue('order_id', 'INV-' + Math.floor(Math.random() * 1000000000))
  // }

  useEffect(() => {
    setButtonRight(
      <Box display={'flex'} alignItems={'center'} gap={2}>
        <Link href={'/invoice/data'}>
          <Button variant='outlined' size='small' startIcon={<Icon icon='mdi:arrow-left' />}>
            {t('Cancel')}
          </Button>
        </Link>
        <Button
          variant='contained'
          size='small'
          startIcon={<Icon icon='ic:round-save' />}
          disabled={create.isLoading || update.isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {t('Save')}
        </Button>
      </Box>
    )

    return () => {
      setButtonRight(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setButtonRight, create.isLoading, update.isLoading, isReturn, products])

  useEffect(() => {
    console.log(errors)
  }, [errors])

  useEffect(() => {
    if (dataOld) {
      setIsLoadingDataOld(true)

      promise(async () => {
        setDateValue(new Date(dataOld.sales.created_at))
        setValue('outlet_id', dataOld.sales.outlet_id)
        setValue('customer_id', dataOld.sales.customer_id)

        setMembershipLevel(dataOld.customer.membership_level)

        setValue('order_id', dataOld.sales.order_id)
        setValue('payment_method', dataOld.sales.payment_method)
        // setValue('note', data.note)
        setGlobalDiscount(dataOld.sales.global_discount)
        setValue('sales_details', dataOld.sales_details)

        const productsSale: InvoiceType[] = await Promise.all(
          (dataOld.sales_details ?? []).map(async item => {
            const productItemData = await productService
              .getProductDetail(item.product_id)
              ?.then(data => {
                return data.data.data
              })

            return {
              id: item.id,
              product: productItemData,
              variant_id: item.product_variant_id,
              qty: item.qty,
              price: item.price,
              discount: item.discount_per_item,
              total: item.price * item.qty
            } as InvoiceType
          })
        )

        setIsLoadingDataOld(false)

        setProducts(productsSale)
      })
      // setValue('purchase_date', data.purchase_date)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataOld])

  return (
    <div>
      <CardWrapper>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} columns={15}>
              <Grid item xs={12} sm={3}>
                <PickerDate onSelectDate={date => setDateValue(date)} value={dateValue} />
              </Grid>
              {getOutlet.data && getOutlet.data?.data.data.length > 1 && (
                <Grid item xs={12} sm={3}>
                  {!getOutlet.isLoading && (
                    <Controller
                      control={control}
                      name='outlet_id'
                      render={({ field }) => (
                        <SelectCustom
                          isFloating
                          value={outlet}
                          onSelect={outlet => {
                            setOutlet(outlet?.id)

                            field.onChange(outlet?.id)
                          }}
                          optionKey={'id'}
                          labelKey={'name'}
                          label='Outlet'
                          options={outletData ?? []}
                          {...(outletData.length == 1 && {
                            defaultValueId: outletData[0]
                          })}
                          {...errorInput(errors, 'outlet_id')}
                        />
                      )}
                    ></Controller>
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={3}>
                <Controller
                  control={control}
                  name='order_id'
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      size='small'
                      fullWidth
                      value={value || ''}
                      onChange={e => {
                        field.onChange(e.target.value ?? '')
                      }}
                      label={isReturn ? t('Return Invoice Number') : t('Invoice Number')}
                      // InputProps={{
                      //   endAdornment: (
                      //     <InputAdornment position='end'>
                      //       <Tooltip title={'Generate ' + t('Purchase Number')} placement='top'>
                      //         <IconButton onClick={generateInvoiceId}>
                      //           <Icon icon='fluent:document-sync-16-filled' fontSize={18} />
                      //         </IconButton>
                      //       </Tooltip>
                      //     </InputAdornment>
                      //   )
                      // }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                {!getCustomer.isLoading && (
                  <Controller
                    control={control}
                    name='customer_id'
                    render={({ field }) => (
                      <SelectCustom
                        isFloating
                        value={customer}
                        onSelect={customer => {
                          setMembershipLevel(customer?.membership_level ?? 1)
                          setCustomer(customer?.id)
                          field.onChange(customer?.id)
                        }}
                        optionKey={'id'}
                        labelKey={'name'}
                        label={t('Customer') ?? 'Customer'}
                        options={customerData ?? []}
                        {...(customerData.length == 1 && {
                          defaultValueId: customerData[0]
                        })}
                        {...errorInput(errors, 'customer_id')}
                        onAddButton={() => {
                          setFormCustomerAddOpen(true)
                        }}
                        onShowButton={() => {
                          router.push('/purchase/supplier')
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Controller
                  control={control}
                  name='payment_method'
                  render={({ field }) => (
                    <SelectCustom
                      {...field}
                      options={['TUNAI', 'KREDIT']}
                      label={t('Payment') ?? 'Payment'}
                      onSelect={value => {
                        field.onChange(value)
                      }}
                      isFloating
                    />
                  )}
                />
              </Grid>
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
                  @{t('Invoice Price')}
                </Grid>
                <Grid item xs={2.2}>
                  @{t('Discount')}
                </Grid>
                <Grid item xs={3}>
                  Total
                </Grid>
              </Grid>
              {!getUnits.isLoading && !isLoadingDataOld && (
                <Grid
                  item
                  container
                  rowSpacing={1}
                  sx={{
                    marginLeft: '-6px !important',
                    '& .MuiGrid-item': {
                      paddingLeft: '6px !important'
                    }
                  }}
                >
                  {[...Array(products.length + 1).keys()].map((item, index) => {
                    if (
                      index == products.length &&
                      (products[index - 1]?.product?.variants ?? []).length > 0 &&
                      !products[index - 1].variant_id
                    )
                      return

                    return (
                      <FormItemInvoice
                        key={index}
                        index={index}
                        membershipLevel={membershipLevel}
                        outletId={outlet}
                        products={products}
                        product={products[index]}
                        unitData={unitData}
                        onDeleted={id => {
                          setDeleteProduct(old => [...old, id])
                        }}
                        setProductInvoice={data => {
                          if (products.length == index && data) {
                            setProducts(old => [...old, data])
                          } else {
                            if (data) {
                              // delete product if update row
                              if (data.id) {
                                // check data is same or not price, qty, discount
                                const dataOld = products.find(item => item.id == data.id)

                                if (
                                  !(
                                    dataOld?.price == data.price &&
                                    dataOld?.qty == data.qty &&
                                    dataOld?.discount == data.discount &&
                                    dataOld?.variant_id == data.variant_id
                                  )
                                ) {
                                  // setDeleteProduct(old => [...old, ...(data.id ? [data.id] : [])])

                                  // delete data.id

                                  setProducts(old => {
                                    old[index] = data

                                    return [...old]
                                  })
                                }
                              } else {
                                setProducts(old => {
                                  old[index] = data

                                  return [...old]
                                })
                              }
                            } else {
                              setProducts(old => {
                                old.splice(index, 1)

                                return [...old]
                              })
                            }
                          }
                        }}
                      />
                    )
                  })}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        {errors.sales_details && (
          <Typography color='error'>{translateFormYupMsg(errors.sales_details.message)}</Typography>
        )}

        <Grid mt={2} container columnSpacing={3}>
          <Grid item xs={6}>
            {/* <InputTextArea minRows={10} placeholder={t('Note') ?? 'Note'} /> */}
          </Grid>
          <Grid item xs={6} container columnSpacing={3} rowSpacing={2} alignItems={'center'}>
            <Grid item xs={6} textAlign={'end'}>
              <Typography>{t('Total Weight')}</Typography>
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
            <Grid item xs={6} textAlign={'end'}>
              <Typography>
                Sub Total ({products.map(item => item.qty).reduce((a, b) => a + b, 0)}) {t('items')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextFieldNumber
                size='small'
                fullWidth
                value={subTotal - discount}
                disabled
                prefix='Rp '
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} textAlign={'end'}>
              <Typography>Global {t('Discount')}</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextFieldNumber
                min={0}
                max={subTotal - discount}
                value={globalDiscount}
                allowNegative={false}
                onChange={value => {
                  if (value != undefined) {
                    setGlobalDiscount(value)
                  } else {
                    setGlobalDiscount(0)
                  }
                }}
                size='small'
                fullWidth
                prefix='Rp '
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} textAlign={'end'}>
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
      <FormDialogSupplier
        open={formCustomerAddOpen}
        toggle={handleCloseFormCustomerDialog}
        selectedData={null}
      />
    </div>
  )
}

export default FormInvoice
