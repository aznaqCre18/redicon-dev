// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
// ** Icon Imports
// ** Types Imports
import { useMutation, useQueryClient } from 'react-query'
import { useEffect, useState } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'
import { toast } from 'react-hot-toast'
import { ResponseType } from 'src/types/response/response'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import PickerDate from 'src/components/form/datepicker/PickerDate'
import InputDiscountOrNominal from 'src/pages/product/data/add/components/InputDiscountOrNominal'
import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  Typography
} from '@mui/material'
import { formatDateInput } from 'src/utils/dateUtils'
import {
  PromotionProductData,
  PromotionProductSchema,
  PromotionProductType
} from 'src/types/apps/promotion/product'
import { promotionProductService } from 'src/services/promotion/product'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import FilterMembership from 'src/components/filter/FilterMembership'
import IconifyIcon from 'src/@core/components/icon'
import { promise } from 'src/utils/promise'
import SelectProductDialog from 'src/components/dialog/SelectProductDialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: PromotionProductType | null
}

const FormPromotionProductDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectData } = props

  const [openSelectProductDialog, setOpenSelectProductDialog] = useState(false)
  const [productSelected, setProductSelected] = useState<string[]>([])
  const [productSelectedName, setProductSelectedName] = useState<string[]>([])

  const [outletIds, setOutletIds] = useState<number[]>([])
  const [membershipIds, setMembershipIds] = useState<number[]>([])
  const [discountType, setDiscountType] = useState<'percentage' | 'nominal'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(0)

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm<PromotionProductData>({
    mode: 'all',
    resolver: yupResolver(PromotionProductSchema)
  })

  const { mutate, isLoading } = useMutation(promotionProductService.create, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('promotion-product-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    promotionProductService.update,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('promotion-product-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: PromotionProductData) => {
    if (productSelected.length === 0) {
      data.list_items = []
    } else {
      console.log('productSelected', productSelected)

      data.list_items = productSelected.map(item => {
        const [productId, variantId] = item.split('-')

        return {
          product_id: Number(productId),
          product_variant_id: variantId != 'null' ? Number(variantId) : null
        }
      })
    }

    if (props.selectData) {
      mutateEdit({ id: props.selectData.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (productSelected.length > 0) {
      if (getValues('list_items').length === 0) {
        setValue(
          'list_items',
          [
            {
              product_id: 1,
              product_variant_id: null
            }
          ],
          { shouldValidate: true }
        )
      }
    } else {
      setValue('list_items', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSelected])

  useEffect(() => {
    if (selectData) {
      setOutletIds([selectData.outlet_id])
      setMembershipIds(selectData.memberships.map(item => item.id))

      promise(() => {
        setDiscountType((selectData.discount_type as 'percentage' | 'nominal') ?? 'percentage')
      }, 200)
      setDiscountValue(selectData.discount_value)

      setProductSelected(
        selectData.list_items.map(item => `${item.product_id}-${item.product_variant_id}`)
      )
      setProductSelectedName(
        selectData.list_items.map(
          item =>
            item.product_name +
            (item.product_variant_attributes
              ? ` (${JSON.parse(atob(item.product_variant_attributes as unknown as string) as any)
                  .map((attr: any) => attr.value)
                  .join(',')})`
              : '')
        )
      )

      setValue('outlet_ids', [selectData.outlet_id])

      setValue('name', selectData.name)
      setValue('description', selectData.description)
      setValue('start_date', selectData.start_date)
      setValue('end_date', selectData.end_date)
      setValue('discount_type', selectData.discount_type)
      setValue('discount_value', selectData.discount_value)

      setValue('is_available_on_monday', selectData.is_available_on_monday)
      setValue('is_available_on_tuesday', selectData.is_available_on_tuesday)
      setValue('is_available_on_wednesday', selectData.is_available_on_wednesday)
      setValue('is_available_on_thursday', selectData.is_available_on_thursday)
      setValue('is_available_on_friday', selectData.is_available_on_friday)
      setValue('is_available_on_saturday', selectData.is_available_on_saturday)
      setValue('is_available_on_sunday', selectData.is_available_on_sunday)
      setValue('is_available_on_pos', selectData.is_available_on_pos)
      setValue('is_available_on_ecommerce', selectData.is_available_on_ecommerce)
      setValue('activation_type', selectData.activation_type)
      setValue('criteria', 'PER PRODUCT')
      setValue('based_on', selectData.based_on)
      setValue('minimum_purchase_price', selectData.minimum_purchase_price)
      setValue('minimum_purchase_quantity', selectData.minimum_purchase_quantity)
      setValue('maximum_discount_value', selectData.maximum_discount_value)

      setValue(
        'list_items',
        selectData.list_items.map(item => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id
        }))
      )

      setValue(
        'customer_membership_ids',
        selectData.memberships.map(m => m.id)
      )
    } else {
      setOutletIds([])
      setMembershipIds([])

      setDiscountType('percentage')
      setDiscountValue(0)

      setProductSelected([])
      setProductSelectedName([])

      setValue('outlet_ids', [])
      setValue('name', '')
      setValue('description', '')
      setValue('start_date', new Date())
      setValue('end_date', new Date())
      setValue('discount_type', 'percentage')
      setValue('discount_value', 0)

      setValue('is_available_on_monday', true)
      setValue('is_available_on_tuesday', true)
      setValue('is_available_on_wednesday', true)
      setValue('is_available_on_thursday', true)
      setValue('is_available_on_friday', true)
      setValue('is_available_on_saturday', true)
      setValue('is_available_on_sunday', true)
      setValue('is_available_on_pos', true)
      setValue('is_available_on_ecommerce', true)
      setValue('activation_type', 'AUTOMATIC')
      setValue('criteria', 'PER PRODUCT')
      setValue('based_on', 'PRICE')
      setValue('minimum_purchase_price', 0)
      setValue('minimum_purchase_quantity', 0)
      setValue('maximum_discount_value', 0)
      setValue('list_items', [])

      setValue('customer_membership_ids', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, open])

  console.log(errors)

  return (
    <Dialog
      title={(selectData ? t('Edit') : t('Add')) + ' ' + t('Product Promotion')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FilterOutlet
            width={'100%'}
            multiple
            value={outletIds}
            onChange={value => {
              setOutletIds(value ?? [])
              setValue('outlet_ids', value ?? [], { shouldValidate: true })
            }}
            isFloating={false}
            label={t('Outlet') || 'Outlet'}
          />
          {errors.outlet_ids && <FormHelperText error>{errors.outlet_ids.message}</FormHelperText>}

          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={t('Promotion Name')}
                placeholder={t('Product Promotion') || 'Product Promotion'}
                {...errorInput(errors, 'name')}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label={t('Description')}
                placeholder={t('Description') || ''}
                {...errorInput(errors, 'description')}
              />
            )}
          />

          <FilterMembership
            width={'100%'}
            multiple
            value={membershipIds}
            onChange={value => {
              setMembershipIds(value ?? [])
              setValue('customer_membership_ids', value ?? [], { shouldValidate: true })
            }}
            isFloating={false}
            label={t('Membership') || 'Membership'}
          />

          {errors.customer_membership_ids && (
            <FormHelperText error>{errors.customer_membership_ids.message}</FormHelperText>
          )}

          <Box>
            <FormLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('Activation Type')}</FormLabel>
            <Controller
              name='activation_type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <RadioButtonCustom
                  value={field.value}
                  options={[
                    { label: t('Automatic'), value: 'AUTOMATIC' },
                    { label: t('Manual'), value: 'MANUAL' }
                  ]}
                  onChange={value => field.onChange(value.value)}
                />
              )}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant='h6'>{t('Promo Duration')}</Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('Start Date')}</FormLabel>
                  <Controller
                    name='start_date'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...field } }) => (
                      <PickerDate
                        {...field}
                        value={new Date(field.value ?? new Date())}
                        fullWidth
                        label={''}
                        onSelectDate={value => {
                          onChange(formatDateInput(value))
                        }}
                        {...errorInput(errors, 'start_date')}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('End Date')}</FormLabel>
                  <Controller
                    name='end_date'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <PickerDate
                        {...field}
                        value={new Date(field.value ?? new Date())}
                        fullWidth
                        label={''}
                        onSelectDate={value => {
                          field.onChange(formatDateInput(value))
                        }}
                        {...errorInput(errors, 'end_date')}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <FormControlLabel
            label={t('Select All Days')}
            sx={{
              pr: 2,
              ml: 0,
              mr: 0
            }}
            control={
              <Checkbox
                size='small'
                name='validation-basic-checkbox'
                checked={
                  (watch('is_available_on_monday') ?? true) &&
                  (watch('is_available_on_tuesday') ?? true) &&
                  (watch('is_available_on_wednesday') ?? true) &&
                  (watch('is_available_on_thursday') ?? true) &&
                  (watch('is_available_on_friday') ?? true) &&
                  (watch('is_available_on_saturday') ?? true) &&
                  (watch('is_available_on_sunday') ?? true)
                }
                onChange={e => {
                  if (e.target.checked) {
                    setValue('is_available_on_monday', true)
                    setValue('is_available_on_tuesday', true)
                    setValue('is_available_on_wednesday', true)
                    setValue('is_available_on_thursday', true)
                    setValue('is_available_on_friday', true)
                    setValue('is_available_on_saturday', true)
                    setValue('is_available_on_sunday', true)
                  } else {
                    setValue('is_available_on_monday', false)
                    setValue('is_available_on_tuesday', false)
                    setValue('is_available_on_wednesday', false)
                    setValue('is_available_on_thursday', false)
                    setValue('is_available_on_friday', false)
                    setValue('is_available_on_saturday', false)
                    setValue('is_available_on_sunday', false)
                  }
                }}
                sx={{
                  p: 1
                }}
              />
            }
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Controller
              name='is_available_on_monday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Monday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_monday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_monday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_tuesday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Tuesday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_tuesday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_tuesday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_wednesday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Wednesday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_wednesday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_wednesday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_thursday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Thursday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_thursday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_thursday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_friday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Friday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_friday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_friday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_saturday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Saturday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_saturday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_saturday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
            <Controller
              name='is_available_on_sunday'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  label={t('Sunday')}
                  sx={{
                    '& .MuiTypography-root': {
                      color: errors.is_available_on_sunday ? 'error.main' : 'text.secondary'
                    },
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    pr: 2,
                    ml: 0,
                    mr: 0
                  }}
                  control={
                    <Checkbox
                      checked={field.value ?? true}
                      {...field}
                      size='small'
                      name='validation-basic-checkbox'
                      sx={{
                        p: 1,
                        ...(errors.is_available_on_sunday ? { color: 'error.main' } : null)
                      }}
                    />
                  }
                />
              )}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant='h6'>{t('Criteria')}</Typography>
            <Typography variant='body2' sx={{ mt: 1 }}>
              {t('Select Product')}
            </Typography>

            <Button
              variant='outlined'
              type='button'
              fullWidth
              onClick={() => setOpenSelectProductDialog(true)}
            >
              {t('Set Product')}
            </Button>

            {productSelectedName.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  mt: 2,
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                {productSelectedName.map((item, index) => (
                  <Box
                    sx={{
                      border: theme => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        backgroundColor: theme => theme.palette.action.hover
                      }
                    }}
                    key={index}
                  >
                    <Box>{item}</Box>
                    <IconButton
                      size='small'
                      onClick={() => {
                        // get index
                        const index = productSelectedName.indexOf(item)

                        // remove item
                        setProductSelectedName(productSelectedName.filter((_, i) => i !== index))

                        setProductSelected(productSelected.filter((_, i) => i !== index))
                      }}
                    >
                      <IconifyIcon icon='mdi:close' />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {errors.list_items && (
              <FormHelperText error sx={{ mb: 2 }}>
                {errors.list_items.message}
              </FormHelperText>
            )}
          </Box>

          <Box>
            <Box>
              <FormLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('Based on')}</FormLabel>
              <Controller
                name='based_on'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <RadioButtonCustom
                    value={field.value}
                    options={[
                      { label: t('Minimum purchase (Rp)'), value: 'PRICE' },
                      { label: t('Minimum quantity (pcs)'), value: 'QUANTITY' }
                    ]}
                    onChange={value => field.onChange(value.value)}
                  />
                )}
              />
            </Box>

            {watch('based_on') === 'PRICE' && (
              <Box>
                <Controller
                  name='minimum_purchase_price'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      label={''}
                      isFloat
                      {...field}
                      prefix='Rp '
                      sx={{ width: '100%' }}
                      placeholder={t('Minimum purchase (Rp)') ?? 'Minimum purchase (Rp)'}
                    />
                  )}
                />
              </Box>
            )}

            {watch('based_on') === 'QUANTITY' && (
              <Box>
                <Controller
                  name='minimum_purchase_quantity'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextFieldNumber
                      label={''}
                      isFloat
                      {...field}
                      sx={{ width: '100%' }}
                      placeholder={t('Minimum quantity (pcs)') ?? 'Minimum quantity (pcs)'}
                    />
                  )}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box>
            <InputLabel sx={{ fontSize: '0.8125rem' }}>{t('Discount')}</InputLabel>
            <InputDiscountOrNominal
              value={discountValue}
              discountType={discountType}
              onChange={value => {
                setDiscountValue(value as number)

                setValue('discount_value', value as number, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
              onChangeDiscountType={value => {
                setDiscountType(value)

                setValue('discount_type', value, {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
            />
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('Maximum discount')}</FormLabel>
            <Controller
              name='maximum_discount_value'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextFieldNumber
                  label={''}
                  isFloat
                  prefix='Rp '
                  {...field}
                  sx={{ width: '100%' }}
                  placeholder={t('Maximum discount') ?? 'Maximum discount'}
                />
              )}
            />
          </Box>
        </Box>

        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={isLoading || isLoadingEdit}
            type='submit'
            variant='contained'
            sx={{ ml: 3 }}
          >
            {t('Submit')}
          </Button>
        </Box>
      </form>
      <SelectProductDialog
        open={openSelectProductDialog}
        toggle={() => {
          setOpenSelectProductDialog(!openSelectProductDialog)
        }}
        selectData={productSelected}
        setSelectData={setProductSelected}
        setSelectDataName={setProductSelectedName}
      />
    </Dialog>
  )
}

export default FormPromotionProductDialog
