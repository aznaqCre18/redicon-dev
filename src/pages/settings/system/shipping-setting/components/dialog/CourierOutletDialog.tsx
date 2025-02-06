import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid, InputLabel, ListItem } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { useApp } from 'src/hooks/useApp'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { courierOutletService } from 'src/services/vendor/courierOutlet'
import {
  CourierOutletData,
  CourierOutletSchema,
  CourierOutletType
} from 'src/types/apps/vendor/courierOutlet'
import { ResponseType } from 'src/types/response/response'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogType {
  open: boolean
  toggle: () => void
  selectData: CourierOutletType | null
  refetch: () => void
}
const CourierOutletDialog = (props: DialogType) => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  const { open, toggle, selectData } = props

  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CourierOutletData>({
    defaultValues: {
      status: 'Active'
    },
    mode: 'all',
    resolver: yupResolver(CourierOutletSchema)
  })

  const { mutate, isLoading } = useMutation(courierOutletService.post, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      props.refetch()
    }
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation(courierOutletService.patch, {
    onSuccess: data => {
      toast.success(t((data as unknown as ResponseType).data.message))
      props.refetch()
    }
  })

  const onSubmit = (data: CourierOutletData) => {
    if (selectData) {
      mutateEdit({ id: selectData.id, data: data })
    } else {
      mutate(data)
    }

    toggle()
    reset()
  }

  const handleClose = () => {
    toggle()
    reset()
  }

  // Image
  const [imgSrc, setImgSrc] = useState('')
  const [, setFiles] = useState<File | null>(null)
  const [inputFileValue, setInputFileValue] = useState('')

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      setFiles(files[0])

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputFileValue(reader.result as string)

        // setValue('bank_image', reader.result as string)
      }
    }
  }

  useEffect(() => {
    if (selectData) {
      setValue('weight_from', selectData.weight_from)
      setValue('weight_to', selectData.weight_to)
      setValue('estimation', selectData.estimation)
      setValue('price', selectData.price)

      setValue('status', selectData.status)
      setStatus(selectData.status)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, open])

  return (
    <Dialog
      title={t(selectData ? t('Edit') : t('Add')) + ' ' + t('Courier Outlet')}
      open={open}
      onClose={handleClose}
    >
      <Box display='flex' justifyContent={'center'} marginBottom={4}>
        <Button component='label'>
          <img src={imgSrc} style={{ width: '100px', objectFit: 'cover' }} alt='Profile Pic' />
          <input
            hidden
            type='file'
            value={inputFileValue}
            accept='image/png, image/jpeg'
            onChange={handleInputImageChange}
            id='account-settings-upload-image'
          />
        </Button>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name='weight_from'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextFieldNumber
                  {...field}
                  fullWidth
                  label={t('Weight From')}
                  {...errorInput(errors, 'weight_from')}
                  InputProps={{
                    endAdornment: 'Gram'
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='weight_to'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextFieldNumber
                  {...field}
                  fullWidth
                  label={t('Weight To')}
                  {...errorInput(errors, 'weight_to')}
                  InputProps={{
                    endAdornment: 'Gram'
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Controller
              name='price'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextFieldNumber
                  {...field}
                  fullWidth
                  label={t('Charge2')}
                  prefix='Rp'
                  {...errorInput(errors, 'price')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Controller
              name='estimation'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextFieldNumber
                  {...field}
                  fullWidth
                  label={t('Delivery Time')}
                  error={Boolean(errors.estimation)}
                  {...(errors.estimation && { helperText: errors.estimation.message })}
                  InputProps={{
                    endAdornment: t('Hour')
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Grid container alignItems={'center'} mt={3}>
          <Grid item xs={12} md={6}>
            <ListItem
              sx={{
                padding: 0
              }}
            >
              <InputLabel>Status: </InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: 2
                }}
              >
                <MuiSwitch
                  checked={status === 'Active'}
                  onChange={e => {
                    setStatus(e.target.checked ? 'Active' : 'Inactive')
                    setValue('status', e.target.checked ? 'Active' : 'Inactive')
                  }}
                />
              </Box>
            </ListItem>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
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
          </Grid>
        </Grid>
      </form>
    </Dialog>
  )
}

export default CourierOutletDialog
