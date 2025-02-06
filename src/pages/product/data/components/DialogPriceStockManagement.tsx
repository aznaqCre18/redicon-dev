import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Button,
  Table,
  TableBody
} from '@mui/material'
import { memo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { productService } from 'src/services/product'
import Dialog from 'src/views/components/dialogs/Dialog'
import awsConfig from 'src/configs/aws'
import {
  PriceMembershipType,
  ProductPriceStockSchema,
  ProductPriceStockSchemaType,
  VariantDataOnlyPriceAndStock,
  VariantTypeOnlyPriceAndStock
} from 'src/types/apps/productType'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getInitials } from 'src/@core/utils/get-initials'
import { useAuth } from 'src/hooks/useAuth'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useTranslation } from 'react-i18next'

interface DialogStockManagementInterface {
  productId: number | undefined
  onClose: () => void
}

const DialogPriceStockManagement = memo(
  ({ productId, onClose }: DialogStockManagementInterface) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const auth = useAuth()

    const { control, handleSubmit, setValue, getValues } = useForm<ProductPriceStockSchemaType>({
      mode: 'onChange',
      resolver: yupResolver(ProductPriceStockSchema)
    })

    const [massPrice, setMassPrice] = useState<number | undefined>()
    const [massStock, setMassStock] = useState<number | undefined>()

    const [reduceOrAddStockVariant, setReduceOrAddStockVariant] = useState<(number | undefined)[]>(
      []
    )

    const handleClose = () => {
      setReduceOrAddStockVariant([])
      setValue('variants', [])
      onClose()
    }

    const { data: productData, isLoading } = useQuery(['product-data', productId], {
      queryFn: () => productService.getProductDetail(productId?.toString() ?? undefined),
      onSuccess: response => {
        setValue('variants', [])

        if (response) {
          const reduceOrAddStockVariant: (number | undefined)[] = []
          response.data.data.variants.map((variant, index) => {
            reduceOrAddStockVariant.push(undefined)
            setValue(
              `variants.${index}.price`,
              Object.keys(variant.price).map(price => variant.price[price])
            )
            // setValue(`variants.${index}.stock`, variant.stock)
          })
          setReduceOrAddStockVariant(reduceOrAddStockVariant)
        }
      }
    })

    const { mutate: updateVarianType } = useMutation(productService.patchProductVariant, {
      onSuccess: () => {
        queryClient.invalidateQueries('product-list')
      }
    })

    const onSubmit = (data: ProductPriceStockSchemaType) => {
      if (data.variants && productData) {
        const variants: VariantDataOnlyPriceAndStock[] =
          data.variants?.map((item: VariantTypeOnlyPriceAndStock) => {
            let _price: PriceMembershipType = {}
            item.price.forEach((price, index) => {
              _price = { ..._price, ...{ [index + 1]: price } }
            })

            return {
              price: _price,
              stock: item.stock
            }
          }) ?? []

        variants.forEach((variant, index) =>
          updateVarianType({
            id: productData.data.data.variants[index].id,
            request: variant
          })
        )

        handleClose()
        toast.success(t('Data updated successfully.'))
      }
    }

    return (
      <Dialog
        title={t(`Edit Stock & Price`)}
        open={productId != null}
        onClose={handleClose}
        maxWidth={'md'}
      >
        {isLoading || reduceOrAddStockVariant.length == 0 ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
              <Grid container>
                <Grid item>
                  <Avatar
                    sx={{ width: '72px', height: '72px', mr: 4 }}
                    variant='square'
                    src={`${awsConfig.s3_bucket_url}/${
                      productData?.data.data.product.media &&
                      productData?.data.data.product.media.length > 0
                        ? productData?.data.data.product.media[0]
                        : ''
                    }`}
                  >
                    {getInitials(productData?.data.data.product.name ?? '')}
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography variant='h6'>{productData?.data.data.product.name}</Typography>
                  <Typography variant='body1'>
                    MSKU: {productData?.data.data.product.sku}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container justifyContent={'end'} alignItems={'center'} spacing={2}>
                <Grid item xs={2}></Grid>
                <Grid item xs={2}>
                  <TextFieldNumber
                    isFloat
                    prefix='Rp '
                    label={t('Price')}
                    size='small'
                    value={massPrice}
                    onChange={value => {
                      setMassPrice(value ? value : undefined)
                    }}
                    fullWidth
                  />
                </Grid>
                {/* <Grid item xs={2}>
                <TextField
                  label='Variant SKU'
                  size='small'
                  type='number'
                  fullWidth
                />
              </Grid> */}
                <Grid item xs={2}>
                  <TextFieldNumber
                    isFloat
                    label={t('New Stock')}
                    size='small'
                    value={massStock}
                    onChange={value => {
                      setMassStock(value ? value : undefined)
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{
                      mt: 1
                    }}
                    fullWidth
                    onClick={() => {
                      if (productData) {
                        if (massPrice)
                          getValues().variants.map((_, index) => {
                            setValue(`variants.${index}.price.0`, massPrice)
                          })
                        if (massStock)
                          getValues().variants.map((_, index) => {
                            setValue(`variants.${index}.stock`, massStock)
                          })

                        const newReduceOrAddStockVariant: number[] = JSON.parse(
                          JSON.stringify(reduceOrAddStockVariant)
                        )
                        getValues().variants.map((_, index) => {
                          newReduceOrAddStockVariant[index] = massStock
                            ? massStock - productData.data.data.variants[index].stock
                            : 0
                        })
                        setReduceOrAddStockVariant(newReduceOrAddStockVariant)
                      }
                    }}
                  >
                    {t('Apply All')}
                  </Button>
                </Grid>
              </Grid>
              <Table
                sx={theme => ({
                  mt: 4,
                  background: theme.palette.customColors.tableHeaderBg,
                  // '& tr:hover': {
                  //   background: theme.palette.divider
                  // },
                  '& th': {
                    borderTop: `thin solid ${theme.palette.divider}`,
                    borderBottom: `thin solid ${theme.palette.divider}`
                  },
                  '& th:first-child': {
                    borderLeft: `thin solid ${theme.palette.divider}`
                  },
                  '& th:last-child': {
                    borderRight: `thin solid ${theme.palette.divider}`
                  },
                  '& td': {
                    borderBottom: `thin solid ${theme.palette.divider}`
                  },
                  '& td:first-child': {
                    borderLeft: `thin solid ${theme.palette.divider}`
                  },
                  '& td:last-child': {
                    borderRight: `thin solid ${theme.palette.divider}`
                  }
                })}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        minWidth: '200px',
                        maxWidth: '120px'
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis'
                      }}
                      colSpan={2}
                    >
                      {t('Variant')}
                    </th>
                    <th
                      style={{
                        textAlign: 'center',
                        minWidth: '100px',
                        maxWidth: '120px'
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis'
                      }}
                    >
                      VSKU
                    </th>
                    <th>{t('Price')}</th>
                    <th>{t('Current Stock')}</th>
                    <th>{t('Add or Reduce')}</th>
                    <th>{t('New Stock')}</th>
                  </tr>
                </thead>
                <TableBody
                  sx={theme => ({
                    backgroundColor: theme.palette.background.paper
                  })}
                >
                  {(productData?.data.data.variants ?? []).map((variant, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          textAlign: 'left',
                          minWidth: '200px',
                          maxWidth: '120px'
                          // overflow: 'hidden',
                          // textOverflow: 'ellipsis'
                        }}
                        colSpan={2}
                        // rowSpan={
                        //   variants.length > 1 ? variants[1].options.length : 1
                        // }
                      >
                        {variant.attributes.map(attribute => attribute.value).join(' - ')}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          minWidth: '100px',
                          maxWidth: '120px'
                          // overflow: 'hidden',
                          // textOverflow: 'ellipsis'
                        }}
                        // rowSpan={
                        //   variants.length > 1 ? variants[1].options.length : 1
                        // }
                      >
                        {variant.sku}
                      </td>
                      <td>
                        <Controller
                          name={`variants.${index}.price.0`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <TextFieldNumber
                              {...{ value, onChange }}
                              size='small'
                              prefix='Rp '
                              fullWidth
                            />
                          )}
                        />
                      </td>
                      <td>
                        <TextFieldNumber disabled size='small' value={variant.stock} fullWidth />
                      </td>
                      <td>
                        <TextFieldNumber
                          size='small'
                          onChange={value => {
                            const newReduceOrAddStockVariant: number[] = JSON.parse(
                              JSON.stringify(reduceOrAddStockVariant)
                            )

                            newReduceOrAddStockVariant[index] = value ?? 0
                            setReduceOrAddStockVariant(newReduceOrAddStockVariant)

                            setValue(`variants.${index}.stock`, variant.stock + (value ?? 0))
                          }}
                          value={reduceOrAddStockVariant[index]}
                          fullWidth
                        />
                      </td>
                      <td>
                        <Controller
                          name={`variants.${index}.stock`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <TextFieldNumber
                              {...{ value }}
                              sx={{
                                mt: 1
                              }}
                              onChange={value => {
                                if (value != undefined) {
                                  onChange(value)

                                  const newReduceOrAddStockVariant: number[] = JSON.parse(
                                    JSON.stringify(reduceOrAddStockVariant)
                                  )
                                  newReduceOrAddStockVariant[index] = value - variant.stock
                                  setReduceOrAddStockVariant(newReduceOrAddStockVariant)
                                }
                              }}
                              size='small'
                              fullWidth
                            />
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
              <Grid container justifyContent={'center'} spacing={4} mt={4}>
                <Grid item>
                  <Button variant='outlined' onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                </Grid>
                <Grid item>
                  {auth.checkPermission('product.update') && (
                    <Button color='primary' variant='contained' type='submit'>
                      {t('Save')}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </form>
        )}
      </Dialog>

      // <DialogActions className='dialog-actions-dense'>
      //   <Button onClick={handleClose} variant='outlined'>
      //     Cancel
      //   </Button>
      //   <Button onClick={handleClose} variant='contained'>
      //     Save
      //   </Button>
      // </DialogActions>
    )
  }
)

export default DialogPriceStockManagement
