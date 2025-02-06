import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import CustomTextField from 'src/components/form/CustomTextField'
import TextFieldNumber from 'src/components/form/TextFieldNumber'
import { customerService } from 'src/services/customer'
import { CustomerType } from 'src/types/apps/customerType'
import { errorInput } from 'src/utils/formUtils'
import { promise } from 'src/utils/promise'
import Dialog from 'src/views/components/dialogs/Dialog'
import * as yup from 'yup'

type DialogCustomerTopUpProps = {
  open: boolean
  onClose: () => void
  customer: CustomerType
}

// yup for code, name, phone, email

const yupSchema = {
  nominal: yup.number().required().min(50000, 'Minimal Rp 50.000'),
  note: yup.string().optional()
}

const defaultValues = {
  nominal: 0,
  note: ''
}

type optionsTopUpType = 'Rp 100.000' | 'Rp 200.000' | 'Rp 500.000' | 'Custom'

const optionsTopUp = ['Rp 100.000', 'Rp 200.000', 'Rp 500.000', 'Custom']

const DialogCustomerTopUp = (props: DialogCustomerTopUpProps) => {
  const { t } = useTranslation()

  const [optionTopUp, setOptionTopUp] = React.useState<optionsTopUpType | null>(null)

  const topUpMutation = useMutation(customerService.topUpGfPayment, {
    onSuccess: (data: any) => {
      props.onClose()
      toast.success(data.data.message)
    }
  })

  const form = useForm({
    mode: 'all',
    defaultValues,
    resolver: yupResolver(yup.object().shape(yupSchema))
  })

  const { handleSubmit, control, formState } = form

  const onSubmit = (values: any) => {
    topUpMutation.mutate({
      id: parseInt(props.customer.id),
      data: {
        amount: values.nominal,
        note: values.note
      }
    })
  }

  useEffect(() => {
    if (optionTopUp) {
      if (optionTopUp !== 'Custom') {
        form.setValue('nominal', parseInt(optionTopUp.replace('Rp ', '').replace('.', '')))
      } else {
        // auto focus
        form.setValue('nominal', 50000)

        promise(() => {
          const input = document.getElementById('topup-nominal')
          if (input) {
            input.focus()
          }
        }, 200)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionTopUp])

  useEffect(() => {
    if (props.open) {
      setOptionTopUp(null)
      form.reset(defaultValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={t('Top Up' + ' ' + t('for') + ' ' + props.customer.name)}
      maxWidth='sm'
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2} columns={{ xs: 6, sm: 12, md: 12 }}>
            {optionsTopUp.map((option, index) => (
              <Grid item key={index} xs={3}>
                <Button
                  fullWidth
                  variant={optionTopUp === option ? 'contained' : 'outlined'}
                  color='primary'
                  onClick={() => setOptionTopUp(option as optionsTopUpType)}
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Controller
            name='nominal'
            control={control}
            render={({ field }) => (
              <TextFieldNumber
                {...field}
                id='topup-nominal'
                fullWidth
                label={t('Nominal')}
                placeholder='Nominal'
                prefix='Rp '
                {...(optionTopUp === 'Custom'
                  ? {}
                  : {
                      sx: {
                        display: 'none'
                      }
                    })}
                {...errorInput(formState.errors, 'nominal')}
              />
            )}
          />

          <Controller
            name='note'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={t('Note') + ' (optional)'}
                placeholder={t('Note') + ' (optional)'}
                {...errorInput(formState.errors, 'note')}
              />
            )}
          />

          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={props.onClose} variant='outlined'>
              {t('Cancel')}
            </Button>
            <Button type='submit' disabled={!formState.isValid} variant='contained'>
              {t('Top Up')}
            </Button>
          </Box>
        </Box>
      </form>
    </Dialog>
  )
}

export default DialogCustomerTopUp
