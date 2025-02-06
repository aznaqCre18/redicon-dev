import { Box, Button, Card, Grid, TextField, styled } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { Icon } from '@iconify/react'
import StockOpnameItem, { StockOpanameType } from './StockOpnameItem'
import Link from 'next/link'
import useAppBarButton from 'src/hooks/useAppBarButton'
import { outletService } from 'src/services/outlet/outlet'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { useQuery } from 'react-query'
import { Controller, useForm } from 'react-hook-form'
import { PurchaseData, PurchaseSchema } from 'src/types/apps/purchase/purchase'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import FormDialogSupplier from 'src/pages/purchase/supplier/components/FormDialogSupplier'
import PickerDate from 'src/components/form/datepicker/PickerDate'

const CardWrapper = styled(Card)(() => ({
  padding: '20px',
  '&:not(:first-of-type)': { marginTop: '20px' }
}))

const FormAdjustment = () => {
  const { t } = useTranslation()

  const [formSupplierAddOpen, setFormSupplierAddOpen] = useState(false)

  const handleCloseFormSupplierDialog = () => {
    setFormSupplierAddOpen(false)
  }

  // useAppBarButton
  const { setButtonRight } = useAppBarButton()

  const [outlet, setOutlet] = useState<number | undefined>(undefined)
  const [outletData, setOutletData] = useState<any[]>([])
  const getOutlet = useQuery('outlet-list', {
    queryFn: () => outletService.getListOutlet(maxLimitPagination),
    onSuccess: data => {
      setOutletData(data.data.data)

      if (data.data.data.length == 1) {
        setValue('outlet_id', data.data.data[0].id)
      }
    }
  })

  const {
    control,
    formState: { errors },
    setValue
  } = useForm<PurchaseData>({
    mode: 'all',
    defaultValues: {
      is_update_purchase_product: false,
      payment_method: 'TUNAI',
      purchase_number: ''
    },
    resolver: yupResolver(PurchaseSchema)
  })

  const [products, setProducts] = useState<StockOpanameType[]>([])

  // useEffect(() => {
  //   setValue('purchase_items', [
  //     ...products.map(item => ({
  //       name: item.product.product.name,
  //       product_id: item.product.product.id,
  //       product_variant_id: item.variant_id,
  //       quantity: item.actualStock,
  //       price: item.recordStock,
  //       discount: item.different ?? 0
  //     }))
  //   ])
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [products])

  const [dateValue, setDateValue] = useState<DateType>(new Date())

  useEffect(() => {
    setButtonRight(
      <Box display={'flex'} alignItems={'center'} gap={2}>
        <Link href='/stock/adjustment'>
          <Button variant='outlined' size='small' startIcon={<Icon icon='mdi:arrow-left' />}>
            {t('Cancel')}
          </Button>
        </Link>
        <Button
          variant='contained'
          size='small'
          startIcon={<Icon icon='ic:round-save' />}
          // onClick={handleSubmit(onSubmit)}
        >
          {t('Save')}
        </Button>
      </Box>
    )

    return () => {
      setButtonRight(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setButtonRight])

  useEffect(() => {
    console.log(errors)
  }, [errors])

  return (
    <div>
      <CardWrapper>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} columns={18}>
              <Grid item xs={12} sm={3}>
                <PickerDate
                  label={t('Adjustment Date') ?? 'Adjustment Date'}
                  onSelectDate={date => {
                    setDateValue(date)
                  }}
                  value={dateValue}
                />
              </Grid>
              {!getOutlet.isLoading && outletData.length > 1 && (
                <Grid item xs={12} sm={3}>
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
                        error={Boolean(errors.outlet_id)}
                        {...(errors.outlet_id && {
                          helperText: errors.outlet_id.message
                        })}
                      />
                    )}
                  ></Controller>
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
                      label={t('No. Adjustment')}
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
                  marginBottom: 2
                })}
                container
                alignItems={'center'}
                columns={11}
                columnSpacing={3}
              >
                <Grid item xs={2} px={2} display={'flex'} spacing={2} alignItems={'center'}>
                  <Icon
                    style={{
                      cursor: 'pointer'
                    }}
                    icon='ph:minus-fill'
                    fontSize={24}
                    color='red'
                  />
                  <Box ml={2}>MSKU/VSKU</Box>
                </Grid>
                <Grid item xs={2}>
                  {t('Product Name')}
                </Grid>
                <Grid item xs={1}>
                  {t('Variant')}
                </Grid>
                <Grid item xs={1}>
                  {t('Qty')}
                </Grid>
                <Grid item xs={1}>
                  Unit
                </Grid>
                <Grid item xs={1}>
                  {t('Price')}
                </Grid>
                <Grid item xs={1}>
                  {t('Recorded Qty')}
                </Grid>
                <Grid item xs={1}>
                  {t('Total')}
                </Grid>
                <Grid item xs={1}>
                  {t('Note')}
                </Grid>
              </Grid>
              <Grid item container rowSpacing={1}>
                {[...Array(products.length + 1).keys()].map((item, index) => (
                  <StockOpnameItem
                    key={index}
                    index={index}
                    products={products}
                    product={products[index]}
                    setStockOpname={data => {
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
      </CardWrapper>
      <FormDialogSupplier
        open={formSupplierAddOpen}
        toggle={handleCloseFormSupplierDialog}
        selectedData={null}
      />
    </div>
  )
}

export default FormAdjustment
