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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { formatDateInput } from 'src/utils/dateUtils'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import FilterMembership from 'src/components/filter/FilterMembership'
import {
  ListItemData,
  PromotionTransactionData,
  PromotionTransactionSchema,
  PromotionTransactionType
} from 'src/types/apps/promotion/transaction'
import { promotionTransactionService } from 'src/services/promotion/transaction'
import { promise } from 'src/utils/promise'
import { Icon } from '@iconify/react'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: PromotionTransactionType | null
}

const FormPromotionTransactionDialog = (props: DialogType) => {
  const { open, toggle, selectData } = props

  // ** Hooks
  const { errorInput } = useApp()
  const { t } = useTranslation()

  // ** Props
  const queryClient = useQueryClient()

  const [transactionData, setTransactionData] = useState<ListItemData[]>([])
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
  } = useForm<PromotionTransactionData>({
    mode: 'all',
    resolver: yupResolver(PromotionTransactionSchema)
  })

  const { mutate, isLoading } = useMutation(promotionTransactionService.create, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('promotion-transaction-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
      toggle()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    promotionTransactionService.update,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('promotion-transaction-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: PromotionTransactionData) => {
    if (transactionData.length === 0) {
      data.list_items = []
    } else {
      data.list_items = transactionData
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

  const addTransaction = () => {
    setTransactionData(prev => [
      ...prev,
      { discount_type: 'percentage', discount_value: 0, maximum_value: 0, minimum_value: 0 }
    ])
  }

  const removeTransaction = (index: number) => {
    setTransactionData(prev => prev.filter((item, i) => i !== index))
  }

  useEffect(() => {
    if (transactionData.length > 0) {
      if (getValues('list_items').length === 0) {
        setValue(
          'list_items',
          [
            {
              discount_type: 'percentage',
              discount_value: 0,
              maximum_value: 0,
              minimum_value: 0
            }
          ],
          { shouldValidate: true }
        )
      }
    } else {
      setValue('list_items', transactionData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionData])

  useEffect(() => {
    if (selectData) {
      setOutletIds([selectData.outlet_id])
      setMembershipIds(selectData.memberships.map(item => item.id))

      promise(() => {
        setDiscountType((selectData.discount_type as 'percentage' | 'nominal') ?? 'percentage')
      }, 200)
      setDiscountValue(selectData.discount_value)

      setTransactionData(
        selectData.list_items.map(item => ({
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          maximum_value: item.maximum_value,
          minimum_value: item.minimum_value
        }))
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
      setValue('criteria', 'MINIMUM PURCHASE')
      setValue('based_on', 'QUANTITY')
      setValue('minimum_purchase_quantity', selectData.minimum_purchase_quantity)
      setValue('maximum_discount_value', selectData.maximum_discount_value)

      setValue(
        'list_items',
        selectData.list_items.map(item => ({
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          maximum_value: item.maximum_value,
          minimum_value: item.minimum_value
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

      setTransactionData([])

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
      setValue('criteria', 'MINIMUM PURCHASE')
      setValue('based_on', 'QUANTITY')
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
      title={(selectData ? t('Edit') : t('Add')) + ' ' + t('Transaction Promotion')}
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
              setValue('outlet_ids', value ?? [])
            }}
            isFloating={false}
            label={t('Outlet') || 'Outlet'}
          />

          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={t('Promotion Name')}
                placeholder={t('Transaction Promotion') || 'Transaction Promotion'}
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

          <Box>
            <Typography variant='h6'>{t('Criteria')}</Typography>

            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ px: '0.2rem !important' }}>
                        {t('Minimum purchase (Rp)')}
                      </TableCell>
                      <TableCell sx={{ px: '0.2rem !important' }}>
                        {t('Maximum purchase (Rp)')}
                      </TableCell>
                      <TableCell sx={{ px: '0.2rem !important' }}>{t('Discount')}</TableCell>
                      <TableCell sx={{ width: 0, px: '0.2rem !important' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ p: '0.2rem !important', border: 0 }}>
                          <TextFieldNumber
                            isFloat
                            prefix='Rp '
                            value={data.minimum_value}
                            onChange={value => {
                              const newData = [...transactionData]

                              newData[index].minimum_value = value ?? 0
                              setTransactionData(newData)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: '0.2rem !important', border: 0 }}>
                          <TextFieldNumber
                            isFloat
                            prefix='Rp '
                            value={data.maximum_value}
                            onChange={value => {
                              const newData = [...transactionData]

                              newData[index].maximum_value = value ?? 0
                              setTransactionData(newData)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: '0.2rem !important', border: 0 }}>
                          <InputDiscountOrNominal
                            value={data.discount_value}
                            discountType={data.discount_type}
                            onChange={value => {
                              const newData = [...transactionData]

                              newData[index].discount_value = value as number
                              setTransactionData(newData)
                            }}
                            onChangeDiscountType={value => {
                              const newData = [...transactionData]

                              newData[index].discount_type = value
                              setTransactionData(newData)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: '0.2rem !important', border: 0 }}>
                          <IconButton size='small' onClick={() => removeTransaction(index)}>
                            <Icon icon='mdi:trash' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button onClick={addTransaction} sx={{ my: 2 }} variant='outlined' fullWidth>
                <Icon icon='mdi:plus' />
                {t('Add criteria')}
              </Button>
              {errors.list_items && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {errors.list_items.message}
                </FormHelperText>
              )}
            </Box>

            <Box>
              <InputLabel sx={{ fontSize: '0.8125rem' }}>{t('Minimum quantity (pcs)')}</InputLabel>
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
    </Dialog>
  )
}

export default FormPromotionTransactionDialog
