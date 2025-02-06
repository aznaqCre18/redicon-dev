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
import {
  PromotionBasicData,
  PromotionBasicSchema,
  PromotionBasicType
} from 'src/types/apps/promotion/basic'
import { promotionBasicService } from 'src/services/promotion/basic'
import FilterOutlet from 'src/components/filter/FilterOutlet'
import PickerDate from 'src/components/form/datepicker/PickerDate'
import InputDiscountOrNominal from 'src/pages/product/data/add/components/InputDiscountOrNominal'
import { FormControl, FormLabel, Grid, InputLabel } from '@mui/material'
import { formatDateInput } from 'src/utils/dateUtils'
import { promise } from 'src/utils/promise'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: PromotionBasicType | null
}

const FormPromotionBasicDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  // ** Props
  const queryClient = useQueryClient()
  const { open, toggle, selectData } = props

  const [outletIds, setOutletIds] = useState<number[]>([])
  const [discountType, setDiscountType] = useState<'percentage' | 'nominal'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(0)

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<PromotionBasicData>({
    mode: 'all',
    resolver: yupResolver(PromotionBasicSchema)
  })

  const { mutate, isLoading } = useMutation(promotionBasicService.create, {
    onSuccess: (data: any) => {
      queryClient.invalidateQueries('promotion-basic-list')

      toast.success(t((data as unknown as ResponseType).data.message))
      reset()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(
    promotionBasicService.update,
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries('promotion-basic-list')

        toast.success(t((data as unknown as ResponseType).data.message))
        reset()
        toggle()
      }
    }
  )

  const onSubmit = (data: PromotionBasicData) => {
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
    if (selectData) {
      setOutletIds([selectData.outlet_id])

      promise(() => {
        setDiscountType((selectData.discount_type as 'percentage' | 'nominal') ?? 'percentage')
      }, 200)

      setDiscountValue(selectData.discount_value)

      setValue('outlet_ids', [selectData.outlet_id])

      setValue('name', selectData.name)
      setValue('description', selectData.description)
      setValue('start_date', selectData.start_date)
      setValue('end_date', selectData.end_date)
      setValue('discount_type', selectData.discount_type)
      setValue('discount_value', selectData.discount_value)
    } else {
      setOutletIds([])

      setDiscountType('percentage')
      setDiscountValue(0)

      setValue('outlet_ids', [])
      setValue('name', '')
      setValue('description', '')
      setValue('start_date', new Date())
      setValue('end_date', new Date())
      setValue('discount_type', 'percentage')
      setValue('discount_value', 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, open])

  return (
    <Dialog
      title={(selectData ? t('Edit') : t('Add')) + ' ' + t('Basic Promotion')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FilterOutlet
            width={'100%'}
            showIfOne
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
                placeholder={t('Basic Promotion') || 'Basic Promotion'}
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

          <Box>
            <InputLabel sx={{ fontSize: '0.8125rem', mb: 1 }}>{t('Discount')}</InputLabel>
            <InputDiscountOrNominal
              isFloat={false}
              label={''}
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

export default FormPromotionBasicDialog
