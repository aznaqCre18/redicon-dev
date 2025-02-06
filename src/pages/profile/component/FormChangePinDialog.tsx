import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useApp } from 'src/hooks/useApp'
import { profileService } from 'src/services/profile'
import { ChangePinSchema, ChangePinType } from 'src/types/apps/profileType'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

interface FormChangePinDialogType {
  open: boolean
  toggle: () => void
}

const FormChangePinDialog = ({ open, toggle }: FormChangePinDialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const handleClose = () => {
    toggle()
  }

  const { mutate: changePin, isLoading } = useMutation(profileService.updatePin, {
    onSuccess: data => {
      const response = data as unknown as ResponseType
      toast.success(t(response.data.message))
      toggle()
    }
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ChangePinType>({
    mode: 'all',
    resolver: yupResolver(ChangePinSchema)
  })

  const onSubmit = (data: ChangePinType) => {
    changePin(data)
  }

  useEffect(() => {
    setValue('old_pin', '')
    setValue('pin', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog title={t('Change PIN')} open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='old_pin'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, ...field } }) => (
            <CustomTextField
              {...field}
              value={value ?? ''}
              {...errorInput(errors, 'old_pin')}
              fullWidth
              sx={{ mb: 4 }}
              type='number'
              label={t('Old PIN')}
              placeholder={t('Old PIN') ?? 'Old PIN'}
            />
          )}
        />
        <Controller
          name='pin'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, ...field } }) => (
            <CustomTextField
              {...field}
              value={value ?? ''}
              {...errorInput(errors, 'pin')}
              fullWidth
              sx={{ mb: 4 }}
              type='number'
              label={t('New PIN')}
              placeholder={t('New PIN') ?? 'New PIN'}
            />
          )}
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading} sx={{ ml: 3 }}>
            {t('Submit')}
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default FormChangePinDialog
