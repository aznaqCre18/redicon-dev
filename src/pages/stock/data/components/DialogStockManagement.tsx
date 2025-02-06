import { Grid, Typography, Box, Avatar, Button, Table, TableBody } from '@mui/material'
import { memo, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { productService } from 'src/services/product'
import Dialog from 'src/views/components/dialogs/Dialog'
import awsConfig from 'src/configs/aws'
import { ProductStockSchema, ProductStockSchemaType } from 'src/types/apps/productType'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { getInitials } from 'src/@core/utils/get-initials'
import { useAuth } from 'src/hooks/useAuth'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import toast from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { StockDetailWithKey } from 'src/types/apps/product/stock'
import { useTranslation } from 'react-i18next'

export interface DataDialogStockManagement {
  stock: StockDetailWithKey
}

interface DialogStockManagementInterface {
  data?: DataDialogStockManagement
  onClose: () => void
}

const DialogStockManagement = memo(({ data, onClose }: DialogStockManagementInterface) => {
  const { t } = useTranslation()

  const inputRef = useRef<HTMLInputElement | null>(null)
  const { stock } = data ?? {}

  const queryClient = useQueryClient()
  const auth = useAuth()

  const { control, handleSubmit, setValue } = useForm<ProductStockSchemaType>({
    mode: 'onChange',
    resolver: yupResolver(ProductStockSchema)
  })

  const [reduceOrAddStock, setReduceOrAddStock] = useState<number>()

  const handleClose = () => {
    setReduceOrAddStock(undefined)
    onClose()
  }

  const { mutate: updateVarianType } = useMutation(productService.updateStock, {
    onSuccess: data => {
      const response = data as unknown as ResponseType

      queryClient.invalidateQueries('stock-list')
      toast.success(t(response.data.message))
      handleClose()
    }
  })

  const onSubmit = (data: ProductStockSchemaType) => {
    if (data.stock != undefined)
      updateVarianType({
        id: stock?.product?.product_variant_id ?? stock?.product.id ?? 0,
        stock: data.stock,
        type: stock?.product?.product_variant_id ? 'variant' : 'product'
      })
    else handleClose()
  }

  useEffect(() => {
    window.setTimeout(function () {
      inputRef.current?.focus()
    }, 100)

    setValue('stock', undefined)

    // setReduceOrAddStock(0)
    // setValue('stock', stock?.product?.stock ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock])

  return (
    <Dialog
      title={t(`Edit Stock`)}
      open={data ? true : false}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { maxWidth: '700px !important' } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <Grid container>
            <Grid item sm={2}>
              <Avatar
                sx={{ width: '72px', height: '72px', mr: 4 }}
                variant='square'
                src={`${awsConfig.s3_bucket_url}/${
                  stock?.product.media && stock?.product.media.length > 0
                    ? stock?.product.media[0]
                    : ''
                }`}
              >
                {getInitials(stock?.product.name ?? '')}
              </Avatar>
            </Grid>
            <Grid item sm={10}>
              <Typography variant='h6'>{stock?.product.name}</Typography>
              <Typography variant='body1'>MSKU: {stock?.product.sku}</Typography>
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
                    // textAlign: 'center',
                    minWidth: '100px',
                    maxWidth: '120px'
                    // overflow: 'hidden',
                    // textOverflow: 'ellipsis'
                  }}
                  rowSpan={1}
                >
                  {t('Variant')}
                </th>
                <th
                  style={{
                    // textAlign: 'center',
                    minWidth: '100px',
                    maxWidth: '120px'
                    // overflow: 'hidden',
                    // textOverflow: 'ellipsis'
                  }}
                  rowSpan={1}
                >
                  VSKU
                </th>
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
              <tr>
                <td
                  style={{
                    // textAlign: 'center',
                    minWidth: '100px',
                    maxWidth: '120px'
                    // overflow: 'hidden',
                    // textOverflow: 'ellipsis'
                  }}
                  rowSpan={1}
                  // rowSpan={
                  //   variants.length > 1 ? variants[1].options.length : 1
                  // }
                >
                  {stock?.product?.attributes?.map(attribute => attribute.value).join(' - ') ?? '-'}
                </td>
                <td
                  style={{
                    // textAlign: 'center',
                    minWidth: '100px',
                    maxWidth: '120px'
                    // overflow: 'hidden',
                    // textOverflow: 'ellipsis'
                  }}
                  rowSpan={1}
                  // rowSpan={
                  //   variants.length > 1 ? variants[1].options.length : 1
                  // }
                >
                  {stock?.product?.vsku ?? '-'}
                </td>
                <td>
                  <TextFieldNumber
                    disabled
                    size='small'
                    value={stock?.product?.stock ?? 0}
                    fullWidth
                  />
                </td>
                <td>
                  <TextFieldNumber
                    inputRef={inputRef}
                    size='small'
                    onChange={value => {
                      setReduceOrAddStock(value ?? 0)
                      setValue(`stock`, (stock?.product?.stock ?? 0) + (value ?? 0))
                    }}
                    value={reduceOrAddStock}
                    fullWidth
                  />
                </td>
                <td>
                  <Controller
                    name={`stock`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextFieldNumber
                        {...{ value }}
                        onChange={value => {
                          if (value != undefined) {
                            onChange(value)
                            const newReduceOrAddStockVariant = value - (stock?.product?.stock ?? 0)
                            setReduceOrAddStock(newReduceOrAddStockVariant)
                          }
                        }}
                        size='small'
                        fullWidth
                      />
                    )}
                  />
                </td>
              </tr>
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
})

export default DialogStockManagement
