import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Typography
} from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import SelectChip from 'src/components/form/select/SelectChip'
import { useApp } from 'src/hooks/useApp'
import { useDataLoading } from 'src/hooks/useDataLoading'
import InputDiscountOrNominal from 'src/pages/product/data/add/components/InputDiscountOrNominal'
import { outletService } from 'src/services/outlet/outlet'
import { adjustmentService } from 'src/services/vendor/adjustment'
import { OutletType } from 'src/types/apps/outlet/outlet'
import {
  AdjustmentData,
  AdjustmentDetailType,
  AdjustmentSchema
} from 'src/types/apps/vendor/adjustment'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { ResponseType } from 'src/types/response/response'
import { pluck } from 'src/utils/arrayUtils'
import { promise } from 'src/utils/promise'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: AdjustmentDetailType | null
}
const FormAdjustmentDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { open, toggle, selectData } = props

  const [adjustmentType, setAdjustmentType] = React.useState<'percentage' | 'nominal'>('percentage')
  const [adjustmentValue, setAdjustmentValue] = React.useState<number>(0)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [outletIdsDefault, setOutletIdsDefault] = React.useState<number[] | undefined>()
  const [outletIds, setOutletIds] = React.useState<number[]>([])
  const {
    data: outletData,
    onLoaded: setOutletData,
    isLoading: isLoadingOutlet
  } = useDataLoading<OutletType[]>([])

  useQuery(['outlet-list'], {
    enabled: Boolean(open),
    queryFn: () => outletService.getListOutlet({ ...maxLimitPagination }),
    onSuccess: data => {
      const outlets = data.data.data

      if (outlets && outlets.length > 0) {
        if (outlets.length == 1) {
          setOutletIdsDefault([outlets[0].id])
          setOutletIds([outlets[0].id])
        } else {
          let defaultOutlet = outlets.find(item => item.is_default)
          if (!defaultOutlet) {
            defaultOutlet = outlets[0]
          }

          // setValue('outlet_ids', [defaultOutlet.id], {
          //   shouldValidate: true,
          //   shouldDirty: true
          // })
        }
      }
      setOutletData(data.data.data ?? [])
    }
  })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<AdjustmentData>({
    mode: 'all',
    resolver: yupResolver(AdjustmentSchema)
  })

  const { mutate, isLoading } = useMutation(adjustmentService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('adjustment-list')

      if (mappingCreateAndDelete) {
        mappingCreateAndDelete([], outletIds ?? [], (data as any).data.data.id)
      }

      handleClose()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(adjustmentService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('adjustment-list')

      if (mappingCreateAndDelete) {
        mappingCreateAndDelete(
          pluck((selectData?.outlets ?? []) as any, 'id') ?? [],
          outletIds ?? [],
          (data as any).data.data.id
        )
      }

      handleClose()
    }
  })

  const { mutate: mutateOutletAdd } = useMutation(adjustmentService.mapOutletCreate, {
    onSuccess: () => {
      queryClient.invalidateQueries('adjustment-list')
    }
  })

  const { mutate: mutateOutletDelete } = useMutation(adjustmentService.deleteOutletMapping, {
    onSuccess: () => {
      queryClient.invalidateQueries('adjustment-list')
    }
  })

  const mappingCreateAndDelete = (
    oldsOutlet: number[],
    newOutlets: number[],
    adjustment_id: number
  ) => {
    const addOutlet = newOutlets.filter(item => !oldsOutlet.includes(item))
    const deleteOutlet = oldsOutlet.filter(item => !newOutlets.includes(item))

    if (addOutlet.length > 0) {
      mutateOutletAdd(addOutlet.map(item => ({ adjustment_id: adjustment_id, outlet_id: item })))
    }

    if (deleteOutlet.length > 0) {
      mutateOutletDelete(
        deleteOutlet.map(item => ({
          adjustment_id: adjustment_id,
          outlet_id: item
        }))
      )
    }
  }

  const onSubmit = (data: AdjustmentData) => {
    if (selectData) {
      mutateEdit({ id: selectData.adjustment.id, data: data })
    } else {
      mutate(data)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  useEffect(() => {
    if (open) {
      if (selectData) {
        setValue('name', selectData.adjustment.name)
        setValue('type', selectData.adjustment.type)
        setValue('value', selectData.adjustment.value)
        setValue('is_included_in_invoice', selectData.adjustment.is_included_in_invoice)
        setValue('is_manual_entry_allowed', selectData.adjustment.is_manual_entry_allowed)
        setValue('is_invoice_value_reduced', selectData.adjustment.is_invoice_value_reduced)
        setValue('is_show_on_pos', selectData.adjustment.is_show_on_pos ?? false)

        setAdjustmentType(selectData.adjustment.type)
        setAdjustmentValue(selectData.adjustment.value)

        promise(() => {
          if (selectData.adjustment.type) {
            document.getElementById('btn-click-' + selectData.adjustment.type)?.click()
          }

          promise(() => {
            setValue('value', selectData.adjustment.value)
          }, 300)
        }, 100)

        setOutletIds(pluck(selectData.outlets, 'id'))
      } else {
        setValue('name', '')
        setValue('type', 'percentage')
        setValue('value', 0)
        setValue('is_included_in_invoice', false)
        setValue('is_manual_entry_allowed', false)
        setValue('is_invoice_value_reduced', false)
        setValue('is_show_on_pos', false)

        setAdjustmentType('percentage')
        setAdjustmentValue(0)

        promise(() => {
          // input-discount-or-nominal
          document.getElementById('btn-click-percentage')?.click()
        }, 100)

        setOutletIds([])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, open])

  return (
    <Dialog
      title={t(selectData ? t('Edit') : t('Add')) + ' ' + t('Adjustment')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoadingOutlet ||
          (outletData.length > 1 && (
            <Box mb={2}>
              <SelectChip
                multiple
                value={outletIds}
                label={t('Outlet') ?? 'Outlet'}
                options={outletData}
                placeholder='Outlet'
                labelKey='name'
                optionKey={'id'}
                onSelect={item => {
                  setOutletIds(item ? pluck(item, 'id') : [])
                }}
                onSelectAll={() => {
                  setOutletIds(pluck(outletData, 'id'))
                }}
                {...errorInput(errors, 'outlet_ids')}
              />
            </Box>
          ))}

        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Adjustment Name')}
              {...errorInput(errors, 'name')}
            />
          )}
        />

        <Box display={'flex'} flexDirection={'column'}>
          <InputLabel
            sx={{
              fontSize: theme => theme.typography.body2.fontSize
            }}
          >
            {t('Adjustment Amount')}
          </InputLabel>
          <Box display={'flex'} flexDirection={'column'}>
            <Box width={210}>
              <InputDiscountOrNominal
                value={adjustmentValue}
                discountType={adjustmentType}
                error={errors.value ? true : false}
                onChange={value => {
                  setAdjustmentValue(value as number)

                  setValue('value', value ?? 0, {
                    shouldValidate: value ? true : false,
                    shouldDirty: true
                  })
                }}
                onChangeDiscountType={value => {
                  setAdjustmentType(value as 'percentage' | 'nominal')

                  setValue('type', value ?? 'percentage', {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }}
              />
            </Box>
            {errors.value && errors.value.message && (
              <Typography variant='body2' color='error' mt={1}>
                {t('Adjustment Amount') + ' ' + t('must be greater than 0')}
              </Typography>
            )}
          </Box>
        </Box>

        <FormGroup sx={{ mt: 2 }}>
          <Controller
            name='is_included_in_invoice'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} {...field} />}
                label={t('Include to Total Transaction')}
              />
            )}
          />

          <Controller
            name='is_manual_entry_allowed'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} {...field} />}
                label={t('Able to Change')}
              />
            )}
          />

          <Controller
            name='is_invoice_value_reduced'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                checked={field.value}
                control={<Checkbox {...field} />}
                label={t('Deduct from Total Amount')}
              />
            )}
          />

          <Controller
            name='is_show_on_pos'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                checked={field.value}
                control={<Checkbox {...field} />}
                label={t('Show on POS')}
              />
            )}
          />
        </FormGroup>

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

export default FormAdjustmentDialog
