import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useApp } from 'src/hooks/useApp'
import { courierService } from 'src/services/vendor/courier'
import { CourierData, CourierSchema, CourierType } from 'src/types/apps/vendor/courier'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectCourier: CourierType | null
}
const FormCourierDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { open, toggle, selectCourier } = props

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CourierData>({
    mode: 'all',
    resolver: yupResolver(CourierSchema)
  })

  const { mutate, isLoading } = useMutation(courierService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('courier-list')

      reset()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(courierService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      queryClient.invalidateQueries('courier-list')

      toggle()
      reset()
    }
  })

  const onSubmit = (data: CourierData) => {
    if (selectCourier) {
      mutateEdit({ id: selectCourier.id, data: data })
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
      if (selectCourier) {
        setValue('name', selectCourier.name)
      } else {
        setValue('name', '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCourier, open])

  return (
    <Dialog
      title={t(selectCourier ? t('Edit') : t('Add')) + ' ' + t('Courier')}
      open={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              sx={{ mb: 4 }}
              label={t('Name') + ' ' + t('Courier')}
              placeholder='Ambil Sendiri'
              {...errorInput(errors, 'name')}
            />
          )}
        />

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

export default FormCourierDialog
