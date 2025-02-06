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
import { ChangePasswordSchema, ChangePasswordType } from 'src/types/apps/profileType'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

interface FormChangePasswordDialogType {
  open: boolean
  toggle: () => void
}

const FormChangePasswordDialog = ({ open, toggle }: FormChangePasswordDialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const handleClose = () => {
    toggle()
  }

  const { mutate: changePassword, isLoading } = useMutation(profileService.updatePassword, {
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
  } = useForm<ChangePasswordType>({
    mode: 'all',
    resolver: yupResolver(ChangePasswordSchema)
  })

  const onSubmit = (data: ChangePasswordType) => {
    changePassword(data)
  }

  useEffect(() => {
    setValue('old_password', '')
    setValue('password', '')
    setValue('password_confirmation', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog title={t('Change Password')} open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='old_password'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, ...field } }) => (
            <CustomTextField
              {...field}
              value={value ?? ''}
              {...errorInput(errors, 'old_password')}
              fullWidth
              sx={{ mb: 4 }}
              type='password'
              label={t('Old Password')}
              placeholder={t('Old Password') ?? 'Old Password'}
            />
          )}
        />
        <Controller
          name='password'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, ...field } }) => (
            <CustomTextField
              {...field}
              value={value ?? ''}
              {...errorInput(errors, 'password')}
              fullWidth
              sx={{ mb: 4 }}
              type='password'
              label={t('New Password')}
              placeholder={t('New Password') ?? 'New Password'}
            />
          )}
        />
        <Controller
          name='password_confirmation'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, ...field } }) => (
            <CustomTextField
              {...field}
              value={value ?? ''}
              {...errorInput(errors, 'password_confirmation')}
              fullWidth
              sx={{ mb: 4 }}
              type='password'
              label={t('Confirm New Password')}
              placeholder={t('Confirm New Password') ?? 'Confirm New Password'}
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

export default FormChangePasswordDialog
