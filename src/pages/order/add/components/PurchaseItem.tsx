import { Icon } from '@iconify/react'
import { Grid, InputAdornment, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { productService } from 'src/services/product'
import { unitService } from 'src/services/unit'
import { ProductDetailType } from 'src/types/apps/productType'
import { UnitType } from 'src/types/apps/unitType'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import SelectCustom from 'src/components/form/select/SelectCustom'

const _unitData: UnitType[] = [
  {
    id: 1,
    vendor_id: 1,
    name: 'Pcs',
    quantity: 1,
    is_default: true,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    vendor_id: 1,
    name: 'Lusin',
    quantity: 12,
    is_default: false,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    vendor_id: 1,
    name: 'Kodi',
    quantity: 20,
    is_default: false,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    vendor_id: 1,
    name: 'Gross',
    quantity: 144,
    is_default: false,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]

const unitData = _unitData.map(item => {
  return {
    ...item,
    name: item.quantity > 1 ? `${item.name} (${item.quantity} Pcs)` : item.name
  }
})

export type InvoiceType = {
  discount: number | null
  qty: number
  total: number
  product: ProductDetailType
  variant_id?: number
}

type props = {
  index: number
  products: InvoiceType[]
  product?: InvoiceType
  setProductInvoice: (value: InvoiceType | null) => void
}

const PurchaseItem = ({ index, products, product, setProductInvoice }: props) => {
  const [isFocus, setIsFocus] = useState<boolean>(false)

  const [isSkuAvailable, setIsSkuAvailable] = useState<boolean>(false)
  const [sku, setSku] = useState<string | undefined>(undefined)
  const [skuOld, setSkuOld] = useState<string | undefined>(undefined)

  const [price, setPrice] = useState<number | undefined>(undefined)
  const [unit, setUnit] = useState<UnitType>(unitData[0])
  const [total, setTotal] = useState<number>(0)

  const defaultPaginationProduct = defaultPagination
  defaultPaginationProduct.sort = 'desc'

  const [dataProduct, setDataProduct] = useState<ProductDetailType[]>([])

  const handleSelectProduct = (value: ProductDetailType) => {
    let discount = value.variants ? 0 : value.product.discount ?? 0
    const discountType = value.product.discount_type
    if (discountType == 'percentage') {
      discount = (discount / 100) * value.product.price[1]
    }

    setPrice(undefined)
    setUnit(unitData[0])
    setIsSkuAvailable(true)

    setProductInvoice({
      qty: 1,
      total: value.variants ? 0 : value.product.price[1],
      discount: discount,
      product: value
    })
  }

  const [paginationData, setPaginationData] =
    useState<PageOptionRequestType>(defaultPaginationProduct)

  const onHandleSearch = (value: string) => {
    setPaginationData({ ...paginationData, query: value, page: 1 })
  }

  const { mutate: getUnit } = useMutation(unitService.getUnit, {
    onSuccess: data => {
      if (data.data.data) {
        setUnit(data.data.data)
      }
    }
  })

  useQuery(['list-product', paginationData], {
    queryFn: () => productService.getListProductDetail({ ...paginationData, status: 'live' }),
    onSuccess: data => {
      setDataProduct(data.data.data ?? [])
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
      console.log(product?.product.product.id ?? '')

      let _price = price
      if (!unit) {
        getUnit(product.product.product.unit_id)
      }

      if (price == undefined) {
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

        if (product.product.variants) {
          if (product.variant_id) {
            const variant = product.product.variants.find(item => item.id == product.variant_id)
            if (variant) {
              _price = variant.price[1]
            }
          }
        } else {
          _price = product.product.product.price[1]
        }
        setSku(product.product.product.sku)
        setSkuOld(product.product.product.sku)
        setPrice(_price)
      }

      setTotal(product.qty * (price ?? 0) * (unit?.quantity ?? 1) - (product.discount ?? 0))
    } else {
      setIsSkuAvailable(false)
      setSku(undefined)
      setSkuOld(undefined)
      setTotal(0)
      setUnit(unitData[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUnit, price, product, unit])

  const variantIdsSelected = useMemo(() => {
    return products.map(item => item.variant_id)
  }, [products])

  const productNonVariantIdsSelected = useMemo(() => {
    return products
      .filter(item => item.variant_id == undefined)
      .map(item => item.product.product.id)
  }, [products])

  return (
    <Grid item borderRadius={1} container alignItems={'center'} columns={10} columnSpacing={3}>
      <Grid item xs={2} px={2} display={'flex'} spacing={2} alignItems={'center'}>
        <Icon
          onClick={() => {
            setProductInvoice(null)
          }}
          style={{
            cursor: 'pointer'
          }}
          icon='ph:minus-fill'
          fontSize={24}
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
                  handleSelectProduct(data.data.data[0])

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
                let discount = value.variants ? 0 : value.product.discount ?? 0
                const discountType = value.product.discount_type
                if (discountType == 'percentage') {
                  discount = (discount / 100) * value.product.price[1]
                }
                setPrice(undefined)
                setUnit(unitData[0])
                setProductInvoice({
                  qty: 1,
                  total: value.variants ? 0 : value.product.price[1],
                  discount: discount,
                  product: value
                })

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
          InputProps={{
            endAdornment: (
              <InputAdornment position='start'>
                {isSkuAvailable ? (
                  <Icon icon='ph:check-circle-fill' color='green' />
                ) : (
                  <Icon icon='ph:x-circle-fill' color='red' />
                )}
              </InputAdornment>
            )
          }}
          sx={{
            ml: 2
          }}
          size='small'
        />
      </Grid>
      <Grid item xs={2}>
        <SelectCustom
          serverSide
          minWidthPaper={500}
          optionKey={['product', 'id']}
          labelKey={['product', 'name']}
          options={dataProduct ?? []}
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
          placeholder='Product'
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
      </Grid>
      {product && (
        <>
          <Grid item xs={1}>
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
                        total: product.qty * value.price[1],
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
              <Grid item xs={1}>
                <TextFieldNumber
                  size='small'
                  min={0}
                  value={product?.qty}
                  onChange={value => {
                    if (value != undefined) {
                      setProductInvoice({
                        ...product,
                        qty: value,
                        total: value * (price ?? 0) * (unit?.quantity ?? 1)
                      })
                    }
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <SelectCustom
                  minWidthPaper={300}
                  options={unitData}
                  optionKey='id'
                  labelKey='name'
                  value={unit?.id ?? undefined}
                  // size='small'
                  // value={unit && unit.quantity}
                  onSelect={value => {
                    if (value != undefined) {
                      setUnit(value)
                    } else {
                      setUnit(unitData[0])
                    }

                    setProductInvoice({
                      ...product,
                      total: value * (price ?? 0) * (value?.quantity ?? 1)
                    })
                  }}
                  // disabled
                  // sx={theme => ({
                  //   backgroundColor: `${theme.palette.action.selected} !important`,
                  //   '& .MuiOutlinedInput-notchedOutline': {
                  //     borderColor: `rgba(${theme.palette.customColors.main}, 0.2) !important`
                  //   }
                  // })}
                  // InputProps={{
                  //   inputProps: {
                  //     min: 0
                  //   },
                  //   endAdornment: (
                  //     <InputAdornment position='start'>{unit && unit.name}</InputAdornment>
                  //   )
                  // }}
                />
              </Grid>
              <Grid item xs={1}>
                <TextFieldNumber
                  value={price}
                  min={0}
                  onChange={value => {
                    if (value) {
                      setPrice(value)
                      setProductInvoice({
                        ...product,
                        total: value * product.qty * (unit?.quantity ?? 1)
                      })
                    } else {
                      setPrice(0)
                      setProductInvoice({
                        ...product,
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
              <Grid item xs={1}>
                <TextFieldNumber
                  size='small'
                  value={product?.discount ?? undefined}
                  max={(price ?? 0) * product?.qty * unit?.quantity ?? 1 ?? undefined}
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
              <Grid item xs={1}>
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
