import { Icon } from '@iconify/react'
import { Grid, TextField, styled } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { productService } from 'src/services/product'
import { ProductDetailType } from 'src/types/apps/productType'
import { UnitType } from 'src/types/apps/unitType'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useTranslation } from 'react-i18next'
import Select from 'src/components/form/select/Select'

const InputGroupComponent = styled('div')(() => {
  return {
    display: 'flex',
    alignItems: 'center',
    '& :first-child > div': {
      borderTopRightRadius: '0 !important',
      borderBottomRightRadius: '0 !important',
      paddingTop: '1px !important',
      paddingBottom: '1px !important'
    },
    '& :last-child > div': {
      borderTopLeftRadius: '0 !important',
      borderBottomLeftRadius: '0 !important',
      borderTopRightRadius: '6px !important',
      borderBottomRightRadius: '6px !important',
      borderLeft: 'none !important',
      '& fieldset': {
        borderLeftColor: 'transparent'
      }
    }
  }
})

export type InvoiceType = {
  id?: number
  discount: number | null
  qty: number
  total: number
  product: ProductDetailType
  price: number
  variant_id?: number
}

type props = {
  index: number
  products: InvoiceType[]
  product?: InvoiceType
  setProductInvoice: (value: InvoiceType | null) => void
  onDeleted?: (index: number) => void
  outletId?: number
  unitData: UnitType[]
}

const PurchaseItem = ({
  index,
  products,
  product,
  setProductInvoice,
  onDeleted,
  outletId,
  unitData
}: props) => {
  const [isFocus, setIsFocus] = useState<boolean>(false)

  const [showSelectProduct, setShowSelectProduct] = useState<boolean>(false)

  const { t } = useTranslation()

  const [isSkuAvailable, setIsSkuAvailable] = useState<boolean>(false)
  const [sku, setSku] = useState<string | undefined>(undefined)
  const [skuOld, setSkuOld] = useState<string | undefined>(undefined)

  const [price, setPrice] = useState<number | undefined>(undefined)
  const [unit, setUnit] = useState<UnitType | undefined>(undefined)
  const [total, setTotal] = useState<number>(0)

  const defaultPaginationProduct = defaultPagination
  defaultPaginationProduct.sort = 'desc'

  const [dataProduct, setDataProduct] = useState<ProductDetailType[]>([])

  const [paginationData, setPaginationData] =
    useState<PageOptionRequestType>(defaultPaginationProduct)

  const onHandleSearch = (value: string) => {
    setPaginationData({ ...paginationData, query: value, page: 1 })
  }

  const getUnit = (id: number) => {
    const unit = unitData.find(item => item.id == id)
    if (unit) {
      setUnit(unit)
    }
  }

  useQuery(['list-product', paginationData, outletId], {
    queryFn: () =>
      productService.getListProductDetail({
        ...paginationData,
        outlet_id: outletId,
        status: 'live'
      }),
    onSuccess: data => {
      setDataProduct(data.data.data ?? [])

      setShowSelectProduct(true)
    }
  })

  const { mutate: mutateProductBySku, data: dataProductBySku } = useMutation(
    productService.getListProductDetail,
    {
      onSuccess: (data, variables) => {
        const productData = (data.data.data ?? []).filter(
          item => item.product.sku == variables?.sku
        )

        if (productData && productData.length > 0) {
          // check available product in products
          if (
            products.find(
              (item, indexItem) =>
                item.product.product.id == productData[0].product.id && index != indexItem
            ) &&
            productData[0].variants == undefined
          ) {
            setIsSkuAvailable(false)
            toast.error('Product already exists')
            onHandleSearch('')
          } else {
            console.log('data', productData)
            setIsSkuAvailable(true)

            setDataProduct(productData)
          }
        }
      }
    }
  )

  useEffect(() => {
    if (product) {
      let _price = price
      if (!unit) {
        getUnit(product.product.product.unit_id)
      }

      if (product.id != undefined) {
        // promise(() => {
        setPrice(product.price)
        setSku(product.product.product.sku)
        setIsSkuAvailable(true)
        // setDataProduct([product.product])
        // }, 1000)
      } else if (price == undefined) {
        setShowSelectProduct(true)
        console.log('debugx product', product)

        // check product exists
        if (
          products.find(
            (item, indexItem) =>
              item.product.product.id == product.product.product.id && index != indexItem
          ) &&
          product.product.variants == undefined
        ) {
          setProductInvoice(null)
          toast.error('Product already exists')
          onHandleSearch('')

          return
        }

        // if (product.product.variants) {
        //   if (product.variant_id) {
        //     const variant = product.product.variants.find(item => item.id == product.variant_id)
        //     if (variant) {
        //       _price = variant.price[1]
        //     }
        //   }
        // } else {
        _price = product.product.product.purchase_price
        // }
        setSku(product.product.product.sku)
        setSkuOld(product.product.product.sku)
        setPrice(_price)
      }

      setTotal(product.qty * ((price ?? 0) - (product.discount ?? 0)))
    } else {
      setIsSkuAvailable(false)
      setSku(undefined)
      setSkuOld(undefined)
      setTotal(0)
      setUnit(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, product])

  const handleSelectProduct = (value: ProductDetailType) => {
    let discount = value.variants ? 0 : value.product.discount ?? 0
    const discountType = value.product.discount_type
    if (discountType == 'percentage') {
      discount = (discount / 100) * value.product.purchase_price
    }

    setPrice(undefined)
    setUnit(value.unit)
    setIsSkuAvailable(true)

    setProductInvoice({
      qty: 1,
      total: value.variants ? value.product.purchase_price : value.product.purchase_price,
      discount: discount,
      price: value.variants ? value.product.purchase_price : value.product.purchase_price,
      product: value,
      variant_id: value.variants && value.variants.length == 1 ? value.variants[0].id : undefined
    })
  }

  useEffect(() => {
    if (price != null && price != product?.price) {
      setProductInvoice({
        ...(product as any),
        price: price
      })

      setPrice(price)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price])

  const variantIdsSelected = useMemo(() => {
    return products.map(item => item.variant_id)
  }, [products])

  const productNonVariantIdsSelected = useMemo(() => {
    return products
      .filter(item => item.variant_id == undefined)
      .map(item => item.product.product.id)
  }, [products])

  return (
    <Grid item borderRadius={1} container alignItems={'center'} columns={20} columnSpacing={3}>
      <Grid item xs={2.4} display={'flex'} spacing={2} alignItems={'center'}>
        <Icon
          onClick={() => {
            if (product?.id) {
              onDeleted?.(product.id)
            }
            setProductInvoice(null)
          }}
          style={{
            cursor: 'pointer'
          }}
          icon='ph:minus-fill'
          fontSize={32}
          color='red'
        />
        <TextField
          id={'sku-' + index}
          value={sku ?? ''}
          onKeyDown={ev => {
            if (ev.key === 'Enter') {
              // Do code here
              ev.preventDefault()

              if (dataProductBySku && isSkuAvailable) {
                const data = dataProductBySku
                if (data.data.data && data.data.data.length > 0) {
                  const value = data.data.data[0]
                  handleSelectProduct(value)

                  window.setTimeout(function () {
                    document.getElementById('sku-' + (index + 1))?.focus()
                  }, 500)

                  return
                }
              }

              if (skuOld) {
                setSku(skuOld)
              }
            }
          }}
          onBlur={() => {
            if (dataProductBySku && isSkuAvailable) {
              const data = dataProductBySku
              if (data.data.data && data.data.data.length > 0) {
                const value = data.data.data[0]
                handleSelectProduct(value)

                return
              }
            }

            if (skuOld) {
              setSku(skuOld)
            }
          }}
          onChange={e => {
            setIsSkuAvailable(false)
            setSku(e.target.value ?? '')

            if (e.target.value) {
              if (e.target.value !== product?.product.product.sku) {
                mutateProductBySku({
                  limit: 1,
                  page: 1,
                  sort: 'asc',
                  order: 'id',
                  status: 'live',
                  sku: e.target.value
                })
              }
            }
          }}
          sx={{
            ml: 2
          }}
          size='small'
        />
      </Grid>
      <Grid item xs={5.4}>
        {(showSelectProduct || product) && (
          <SelectCustom
            serverSide
            minWidthPaper={500}
            optionKey={['product', 'id']}
            labelKey={['product', 'name']}
            options={[
              ...(dataProduct ?? []),
              ...(product &&
              !dataProduct.find(item => item.product.id == product.product.product.id)
                ? [product.product]
                : [])
            ]}
            getOptionDisabled={(option: any) =>
              productNonVariantIdsSelected.includes(option.product.id) &&
              product?.product.product.id != option.product.id
            }
            onFocus={bool => setIsFocus(bool)}
            onInputChange={(_, value) => {
              if (isFocus) {
                onHandleSearch(value ?? '')
              }
              // setProductInvoice(null)
            }}
            placeholder={t('Product') ?? 'Product'}
            onSelect={value => {
              if (value) {
                handleSelectProduct(value)
              } else {
                setProductInvoice(null)
              }
            }}
            value={product?.product.product.id ?? ''}
            onAddButton={() => {
              window.open('/product/data/add', '_blank')
            }}
            onShowButton={() => {
              window.open('/product', '_blank')
            }}
          />
        )}
        {!(showSelectProduct || product) && <SelectCustom minWidthPaper={500} options={[]} />}
      </Grid>
      {product && (
        <>
          <Grid item xs={1.8}>
            {product?.product.variants ? (
              <SelectCustom
                minWidthPaper={300}
                optionKey='id'
                renderLabel={option => {
                  return option.attributes?.map((attribute: any) => attribute.value).join(' - ')
                }}
                options={product.product.variants ?? []}
                getOptionDisabled={(option: any) =>
                  variantIdsSelected.includes(option.id) && product.variant_id != option.id
                }
                onSelect={value => {
                  if (value) {
                    // check products is variant duplicate
                    const existVariant = products.find(item => item.variant_id == value.id)

                    if (existVariant) {
                      toast.error('Variant already exists')

                      return
                    } else {
                      setProductInvoice({
                        ...product,
                        total: product.qty * product.price,
                        variant_id: value.id
                      })
                    }
                  } else {
                    setProductInvoice({
                      ...product,
                      total: 0,
                      variant_id: undefined
                    })
                  }
                }}
                placeholder='Variant'
                value={product?.variant_id ?? undefined}
              />
            ) : (
              <TextField
                disabled
                label='-'
                sx={theme => ({
                  backgroundColor: `${theme.palette.action.selected} !important`,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: `rgba(${theme.palette.customColors.main}, 0.2) !important`
                  }
                })}
                size='small'
              />
            )}
          </Grid>
          {!(product?.product.variants && product?.variant_id == undefined) && (
            <>
              <Grid item xs={3}>
                <InputGroupComponent>
                  <TextFieldNumber
                    sx={{
                      width: '80%'
                    }}
                    size='small'
                    min={0}
                    value={product?.qty}
                    onChange={value => {
                      if (value != undefined) {
                        setProductInvoice({
                          ...product,
                          qty: value,
                          total: value * product.price
                        })
                      }
                    }}
                    InputProps={{
                      inputProps: {
                        min: 0
                      }
                    }}
                  />
                  {unit && (
                    <Select
                      options={[
                        {
                          value: unit.id as any,
                          label: unit.name
                        }
                      ]}
                      value={unit.id}
                    />
                  )}
                </InputGroupComponent>
              </Grid>
              <Grid item xs={2.2}>
                <TextFieldNumber
                  fullWidth
                  value={price}
                  min={0}
                  onChange={value => {
                    if (value) {
                      setPrice(value)
                      setProductInvoice({
                        ...product,
                        price: value,
                        total: value * product.qty
                      })
                    } else {
                      setPrice(0)
                      setProductInvoice({
                        ...product,
                        price: 0,
                        total: 0
                      })
                    }
                  }}
                  size='small'
                  prefix='Rp '
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              </Grid>
              <Grid item xs={2.2}>
                <TextFieldNumber
                  size='small'
                  value={product?.discount ?? undefined}
                  max={(price ?? 0) * product?.qty ?? 1 ?? undefined}
                  onChange={value => {
                    if (value != undefined) {
                      setProductInvoice({
                        ...product,
                        discount: value
                      })
                    } else {
                      setProductInvoice({
                        ...product,
                        discount: null
                      })
                    }
                  }}
                  prefix='Rp '
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextFieldNumber
                  value={total}
                  disabled
                  size='small'
                  prefix='Rp '
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              </Grid>
            </>
          )}
        </>
      )}
    </Grid>
  )
}

export default PurchaseItem
