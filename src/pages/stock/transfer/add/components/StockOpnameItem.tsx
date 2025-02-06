import { Icon } from '@iconify/react'
import { Grid, InputAdornment, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { productService } from 'src/services/product'
import { unitService } from 'src/services/unit'
import { ProductDetailType } from 'src/types/apps/productType'
import { UnitType } from 'src/types/apps/unitType'
import { PageOptionRequestType, defaultPagination } from 'src/types/pagination/pagination'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useTranslation } from 'react-i18next'

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

export type StockOpanameType = {
  different: number | null
  actualStock: number | null
  remark: string
  product: ProductDetailType
  recordStock: number
  variant_id?: number
}

type props = {
  index: number
  products: StockOpanameType[]
  product?: StockOpanameType
  setStockOpname: (value: StockOpanameType | null) => void
}

const StockOpnameItem = ({ index, products, product, setStockOpname }: props) => {
  const { t } = useTranslation()

  const [isSkuAvailable, setIsSkuAvailable] = useState<boolean>(false)
  const [sku, setSku] = useState<string | undefined>(undefined)
  const [skuOld, setSkuOld] = useState<string | undefined>(undefined)

  const [recordStock, setRecordStock] = useState<number | undefined>(undefined)
  const [unit, setUnit] = useState<UnitType>(unitData[0])
  const [remark, setRemark] = useState<string>('')

  const defaultPaginationProduct = defaultPagination
  defaultPaginationProduct.sort = 'desc'

  const [dataProduct, setDataProduct] = useState<ProductDetailType[]>([])

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
          } else {
            console.log('data', productData)
            setIsSkuAvailable(true)

            setDataProduct(productData)
          }

          // const value = data.data.data[0]
          // let discount = value.variants ? 0 : value.product.discount ?? 0
          // const discountType = value.product.discount_type
          // if (discountType == 'percentage') {
          //   discount = (discount / 100) * value.product.price[1]
          // }
          // setPrice(undefined)
          // setUnit(unitData[0])
          // setProductInvoice({
          //   qty: 1,
          //   total: value.variants ? 0 : value.product.price[1],
          //   discount: discount,
          //   product: value
          // })
        }
      }
    }
  )

  useEffect(() => {
    if (product) {
      console.log(product?.product.product.id ?? '')

      let _recordStock = recordStock
      if (!unit) {
        getUnit(product.product.product.unit_id)
      }

      if (recordStock == undefined) {
        // check product exists
        if (
          products.find(
            (item, indexItem) =>
              item.product.product.id == product.product.product.id && index != indexItem
          ) &&
          product.product.variants == undefined
        ) {
          setStockOpname(null)
          toast.error('Product already exists')

          return
        }

        if (product.product.variants) {
          if (product.variant_id) {
            const variant = product.product.variants.find(item => item.id == product.variant_id)
            if (variant) {
              _recordStock = variant.stock
            }
          }
        } else {
          _recordStock = product.product.product.stock
        }
        setSku(product.product.product.sku)
        setSkuOld(product.product.product.sku)
        setRecordStock(_recordStock)
      }
    } else {
      setIsSkuAvailable(false)
      setSku(undefined)
      setSkuOld(undefined)
      setUnit(unitData[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUnit, recordStock, product, unit])

  return (
    <Grid item borderRadius={1} container alignItems={'center'} columns={10} columnSpacing={3}>
      <Grid item xs={2} px={2} display={'flex'} spacing={2} alignItems={'center'}>
        <Icon
          onClick={() => {
            setStockOpname(null)
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
                  const value = data.data.data[0]
                  let discount = value.variants ? 0 : value.product.discount ?? 0
                  const discountType = value.product.discount_type
                  if (discountType == 'percentage') {
                    discount = (discount / 100) * value.product.price[1]
                  }
                  setRecordStock(undefined)
                  setUnit(unitData[0])
                  setStockOpname({
                    actualStock: null,
                    remark: '',
                    different: discount,
                    recordStock: value.variants ? 0 : value.product.stock,
                    product: value
                  })

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
                setRecordStock(undefined)
                setUnit(unitData[0])
                setStockOpname({
                  actualStock: null,
                  remark: '',
                  different: discount,
                  recordStock: value.variants ? 0 : value.product.stock,
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
          onInputChange={(_, value) => {
            onHandleSearch(value)
            // setProductInvoice(null)
          }}
          placeholder={t('Product') ?? 'Product'}
          onSelect={value => {
            if (value) {
              let discount = value.variants ? 0 : value.product.discount ?? 0
              const discountType = value.product.discount_type
              if (discountType == 'percentage') {
                discount = (discount / 100) * value.product.price[1]
              }

              setRecordStock(undefined)
              setUnit(unitData[0])
              setIsSkuAvailable(true)

              setStockOpname({
                actualStock: null,
                remark: '',
                different: discount,
                recordStock: value.variants ? 0 : value.product.stock,
                product: value,
                variant_id:
                  value.variants && value.variants.length == 1 ? value.variants[0].id : undefined
              })
            } else {
              setStockOpname(null)
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
                onSelect={value => {
                  if (value) {
                    setStockOpname({
                      ...product,
                      remark: '',
                      variant_id: value.id
                    })
                  } else {
                    setStockOpname({
                      ...product,
                      remark: '',
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
              <Grid item xs={1}>
                <TextFieldNumber
                  size='small'
                  min={0}
                  value={product?.actualStock}
                  onChange={value => {
                    if (value != undefined) {
                      setStockOpname({
                        ...product,
                        actualStock: value,
                        different: value - (recordStock ?? 0)
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

                    setStockOpname({
                      ...product
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
                  disabled
                  value={recordStock}
                  min={0}
                  onChange={value => {
                    if (value) {
                      setRecordStock(value)
                      setStockOpname({
                        ...product,
                        recordStock: value
                      })
                    } else {
                      setRecordStock(0)
                      setStockOpname({
                        ...product,
                        recordStock: 0
                      })
                    }
                  }}
                  size='small'
                  InputProps={{
                    inputProps: {
                      min: 0
                    }
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField value={remark} size='small' onChange={e => setRemark(e.target.value)} />
              </Grid>
            </>
          )}
        </>
      )}
    </Grid>
  )
}

export default StockOpnameItem
