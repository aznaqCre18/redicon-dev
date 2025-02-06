import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  styled
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { Icon } from '@iconify/react'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import Link from 'next/link'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { supplierService } from 'src/services/supplier'
import { purchaseService } from 'src/services/purchase/purchase'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { Controller, useForm } from 'react-hook-form'
import {
  PurchaseData,
  PurchaseDataUpdate,
  PurchaseDetailType,
  PurchaseSchema,
  PurchaseUpdateSchema
} from 'src/types/apps/purchase/purchase'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import FormDialogSupplier from './FormDialogSupplier'
import { useTranslation } from 'react-i18next'
import PurchaseItem, { InvoiceType } from './PurchaseItem'
import { promise } from 'src/utils/promise'
import { addHours } from 'date-fns'
import { UnitType } from 'src/types/apps/unitType'
import { unitService } from 'src/services/unit'
import { productService } from 'src/services/product'
import { useApp } from 'src/hooks/useApp'
import PickerDate from 'src/components/form/datepicker/PickerDate'

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '20px' }
}))

const FormPurchase = ({ data: dataOld }: { data?: PurchaseDetailType }) => {
  const { errorInput, translateFormYupMsg } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isLoadingDataOld, setIsLoadingDataOld] = useState(false)

  const [formSupplierAddOpen, setFormSupplierAddOpen] = useState(false)

  const handleCloseFormSupplierDialog = () => {
    setFormSupplierAddOpen(false)
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
          setOutlet(dataOld.outlet_id)
        }, 200)
      } else if (data.data.data.length == 1) {
        setValue('outlet_id', data.data.data[0].id)
      }
    }
  })

  const [supplier, setSupplier] = useState<number | undefined>(undefined)
  const [supplierData, setSupplierData] = useState<any[]>([])
  const getSupplier = useQuery('supplier-list', {
    queryFn: () => supplierService.getList(maxLimitPagination),
    onSuccess: data => {
      const _data = data.data.data ?? []
      setSupplierData(_data)

      if (dataOld) {
        promise(() => {
          setSupplier(dataOld.supplier_id)
        }, 200)
      } else if (_data.length == 1) {
        setValue('supplier_id', _data[0].id)
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

  const create = useMutation(purchaseService.create, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('supplier-list')

      router.push('/purchase/data')
    }
  })

  const update = useMutation(purchaseService.update, {
    onSuccess: (data: any) => {
      toast.success(t((data as unknown as ResponseType).data.message))

      queryClient.invalidateQueries('supplier-list')

      router.push('/purchase/data')
    }
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm<PurchaseData | PurchaseDataUpdate>({
    mode: 'all',
    defaultValues: {
      is_update_purchase_product: false,
      created_at: new Date().toISOString(),
      payment_method: 'TUNAI',
      purchase_number: ''
    },
    resolver: yupResolver(dataOld ? PurchaseUpdateSchema : PurchaseSchema)
  })

  const onSubmit = (dataNew: PurchaseData | PurchaseDataUpdate) => {
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
      const dataOldIds = dataOld.purchase_items.map(item => item.id)
      const dataNewUpdate = dataNew as PurchaseDataUpdate
      // filter dataNew.purchase_items.id is not exist on dataOld.purchase_items.purchase_item_deleted and not have id
      // dataNewUpdate.purchase_items = dataNewUpdate.purchase_items.filter(
      //   (item: any) => !dataOldIds.includes(item.id)
      // )

      if (
        dataOldIds.length == dataNewUpdate.purchase_item_deleted.length &&
        dataNewUpdate.purchase_items.length == 0
      ) {
        toast.error('Please add new product or update product')

        return
      }

      update.mutate({
        id: dataOld.id.toString(),
        data: dataNew as PurchaseDataUpdate
      })
    } else {
      create.mutate(dataNew)
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
      'purchase_items',
      [
        ...products.map(item => ({
          id: item.id,
          name: item.product.product.name,
          product_id: item.product.product.id,
          product_variant_id: item.variant_id,
          quantity: item.qty,
          price: item.price,
          discount: item.discount ?? 0
        }))
      ],
      {
        shouldValidate: products.length > 0
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  useEffect(() => {
    setValue('grand_discount', globalDiscount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDiscount])

  useEffect(() => {
    const deleteProductNotDuplicate = Array.from(new Set(deleteProduct))

    setValue('purchase_item_deleted', deleteProductNotDuplicate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteProduct])

  const [dateValue, setDateValue] = useState<DateType>(new Date())

  useEffect(() => {
    if (dateValue) setValue('created_at', addHours(dateValue as Date, 7).toISOString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue])

  // const generateInvoiceId = () => {
  //   setValue('purchase_number', 'INV-' + Math.floor(Math.random() * 1000000000))
  // }

  useEffect(() => {
    setButtonRight(
      <Box display={'flex'} alignItems={'center'} gap={2}>
        {/* <Controller
          control={control}
          name='is_update_purchase_product'
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox defaultChecked checked={field.value} onChange={field.onChange} />}
              label={t('Update Purchase Product')}
            />
          )}
        /> */}
        <Link href={'/goods-receipt'}>
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
  }, [setButtonRight, create.isLoading, update.isLoading, products])

  useEffect(() => {
    console.log(errors)
  }, [errors])

  useEffect(() => {
    if (dataOld) {
      setIsLoadingDataOld(true)

      promise(async () => {
        setDateValue(addHours(new Date(dataOld.created_at), -7))
        setValue('outlet_id', dataOld.outlet_id)
        setValue('supplier_id', dataOld.supplier_id)
        setValue('purchase_number', dataOld.purchase_number)
        setValue('payment_method', dataOld.payment_method)
        // setValue('note', data.note)
        setGlobalDiscount(dataOld.grand_discount)
        setValue('purchase_items', dataOld.purchase_items)

        const productsPurchase: InvoiceType[] = await Promise.all(
          (dataOld.purchase_items ?? []).map(async item => {
            const productItemData = await productService
              .getProductDetail(item.product_id)
              ?.then(data => {
                return data.data.data
              })

            return {
              id: item.id,
              product: productItemData,
              // product: {
              //   ...item,
              //   variants: [item.product_variant]
              // },
              variant_id: item.product_variant_id,
              qty: item.quantity,
              price: item.price,
              discount: item.discount,
              total: item.price * item.quantity
            } as any
          })
        )

        setIsLoadingDataOld(false)

        setProducts(productsPurchase)
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
                <PickerDate
                  label={t('Date') ?? 'Date'}
                  value={dateValue}
                  onSelectDate={date => setDateValue(date)}
                />
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
                  name='purchase_number'
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      size='small'
                      fullWidth
                      value={value || ''}
                      onChange={e => {
                        field.onChange(e.target.value ?? '')
                      }}
                      label={t('Order Number')}
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
                {!getSupplier.isLoading && (
                  <Controller
                    control={control}
                    name='supplier_id'
                    render={({ field }) => (
                      <SelectCustom
                        isFloating
                        value={supplier}
                        onSelect={supplier => {
                          setSupplier(supplier?.id)
                          field.onChange(supplier?.id)
                        }}
                        optionKey={'id'}
                        labelKey={'name'}
                        label='Supplier'
                        options={supplierData ?? []}
                        {...(supplierData.length == 1 && {
                          defaultValueId: supplierData[0]
                        })}
                        {...errorInput(errors, 'supplier_id')}
                        onAddButton={() => {
                          setFormSupplierAddOpen(true)
                        }}
                        onShowButton={() => {
                          router.push('/purchase/supplier')
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
              {/* <Grid item xs={12} sm={3}>
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
              </Grid> */}
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
                <Grid item xs={1}>
                  Line
                </Grid>
                <Grid item xs={2.2} px={2} display={'flex'} spacing={2} alignItems={'center'}>
                  {/* <Icon
                    style={{
                      cursor: 'pointer'
                    }}
                    icon='ph:minus-fill'
                    fontSize={18}
                    color='red'
                    onClick={deleteAllProduct}
                  /> */}
                  <Box ml={2}>Material ID</Box>
                </Grid>
                <Grid item xs={4.6}>
                  {t('Product Name')}
                </Grid>
                <Grid item xs={1.8}>
                  {t('Variant')}
                </Grid>
                <Grid item xs={1.2}>
                  Ok
                </Grid>
                <Grid item xs={1.5}>
                  Qty
                </Grid>
                <Grid item xs={1.3}>
                  UOM
                </Grid>
                <Grid item xs={3.1}>
                  {t('Cost Center')}
                </Grid>
                <Grid item xs={3}>
                  G/L
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
                      <PurchaseItem
                        key={index}
                        index={index}
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
        {errors.purchase_items && (
          <Typography color='error'>
            {translateFormYupMsg(errors.purchase_items.message)}
          </Typography>
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
            {/* <Grid item xs={6} textAlign={'end'}>
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
            </Grid> */}
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
        open={formSupplierAddOpen}
        toggle={handleCloseFormSupplierDialog}
        selectedData={null}
      />
    </div>
  )
}

export default FormPurchase
