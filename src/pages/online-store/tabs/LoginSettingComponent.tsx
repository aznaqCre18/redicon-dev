import React, { useEffect, useState } from 'react'
import { Box } from '@mui/system'
import { styled } from '@mui/material/styles'
import {
  List,
  ListItem,
  InputLabel,
  Button,
  Switch,
  Typography,
  TextField,
  CircularProgress
} from '@mui/material'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'
import {
  StoreCustomerSettingData,
  StoreCustomerSettingSchema,
  StoreCustomerSettingType
} from 'src/types/apps/vendor/settings/store'
import { useMutation, useQuery } from 'react-query'
import { storeSettingService } from 'src/services/vendor/settings/store'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))
const MuiBorderBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),

  display: 'flex',
  flexDirection: 'column',
  gap: 2
}))

const MuiSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main
  },
  margin: 0
}))

const LoginSettingComponent = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()

  const [isPhoneActivation, setIsPhoneActivation] = useState<boolean>(false)
  const [isPhoneService, setIsPhoneService] = useState<boolean>(false)

  const [customerSettingData, setCustomerSettingData] = useState<StoreCustomerSettingType>()

  useQuery('store-setting-customer', storeSettingService.customer, {
    onSuccess: data => {
      setCustomerSettingData(data.data.data)
    }
  })

  const { control, handleSubmit, setValue } = useForm<StoreCustomerSettingData>({
    mode: 'all',
    resolver: yupResolver(StoreCustomerSettingSchema)
  })

  const { mutate: updateSetting } = useMutation(storeSettingService.updateCustomer, {
    onSuccess: data => {
      toast.success(t(data.data.message))
    }
  })

  const onSubmit = (data: StoreCustomerSettingData) => {
    data.phone_activations = data.phone_activations == '' ? null : data.phone_activations
    data.phone_services = data.phone_services == '' ? null : data.phone_services
    data.details_inactive_status =
      data.details_inactive_status == '' ? null : data.details_inactive_status

    updateSetting(data)
  }

  useEffect(() => {
    if (customerSettingData) {
      setValue('is_customer_required_login', customerSettingData.is_customer_required_login)
      setValue('is_regist_need_confirm', customerSettingData.is_regist_need_confirm)
      setValue('phone_activations', customerSettingData.phone_activations)
      setValue('phone_services', customerSettingData.phone_services)
      setValue('details_inactive_status', customerSettingData.details_inactive_status)

      setIsPhoneActivation(customerSettingData.phone_activations ? true : false)
      setIsPhoneService(customerSettingData.phone_services ? true : false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSettingData])

  if (!customerSettingData) return <CircularProgress />

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {checkPermission('login setting.read') && (
        <>
          <List
            sx={{
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '& .MuiListItem-root': {
                display: 'grid',
                gridTemplateColumns: 'min(280px) 1fr'
              }
            }}
          >
            <Typography fontWeight={'bold'} variant='h5' mb={1}>
              {t('General')}
            </Typography>
            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Customer required login')}</InputLabel>
                <RadioButtonCustom
                  value={customerSettingData.is_customer_required_login ? 1 : 0}
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: t('required') },
                    { value: 0, label: t('no required') }
                  ]}
                  onChange={value => {
                    setValue(
                      'is_customer_required_login',
                      (value.value as number) == 1 ? true : false
                    )
                  }}
                />
              </MuiListItem>
              {/* <MuiListItem>
            <InputLabel>Aktifkan OTP WhatsApp, E-mail, SMS</InputLabel>
            <MuiSwitch />
          </MuiListItem> */}
              <MuiListItem>
                <InputLabel>{t('Register must confirm by admin')}</InputLabel>
                <RadioButtonCustom
                  value={customerSettingData.is_regist_need_confirm ? 1 : 0}
                  sx={{
                    ml: 3
                  }}
                  options={[
                    { value: 1, label: 'Wajib' },
                    { value: 0, label: 'Tidak Wajib' }
                  ]}
                  onChange={value => {
                    setValue('is_regist_need_confirm', (value.value as number) == 1 ? true : false)
                  }}
                />
              </MuiListItem>
              <MuiListItem>
                <InputLabel>{t('WhatsApp number customer activations')}</InputLabel>
                <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'}>
                  <MuiSwitch
                    checked={isPhoneActivation}
                    onChange={e => {
                      setIsPhoneActivation(e.target.checked)
                    }}
                  />
                  <Controller
                    control={control}
                    name='phone_activations'
                    render={({ field: { value, ...field } }) => (
                      <TextField
                        value={value ?? ''}
                        {...field}
                        type='number'
                        size={'small'}
                        sx={{
                          ml: 2
                        }}
                      />
                    )}
                  />
                </Box>
              </MuiListItem>
              <MuiListItem
                sx={{
                  mt: 1
                }}
              >
                <InputLabel>{t('WhatsApp number customer service')}</InputLabel>
                <Box display={'flex'} flexDirection={'row'} gap={2} alignItems={'center'}>
                  <MuiSwitch
                    checked={isPhoneService}
                    onChange={e => setIsPhoneService(e.target.checked)}
                  />
                  <Controller
                    control={control}
                    name='phone_services'
                    render={({ field: { value, ...field } }) => (
                      <TextField
                        value={value ?? ''}
                        {...field}
                        type='number'
                        size={'small'}
                        sx={{
                          ml: 2
                        }}
                      />
                    )}
                  />
                </Box>
              </MuiListItem>
              <MuiListItem
                sx={{
                  mt: 1,
                  mb: 2,
                  alignItems: 'flex-start'
                }}
              >
                <InputLabel>{t('Detail Inactive Status')}</InputLabel>
                <Controller
                  control={control}
                  name='details_inactive_status'
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      value={value ?? ''}
                      {...field}
                      size={'small'}
                      multiline
                      rows={2}
                      sx={{
                        maxWidth: 500,
                        ml: 2
                      }}
                    />
                  )}
                />
              </MuiListItem>
            </MuiBorderBox>

            {/* <Typography fontWeight={'bold'} variant='h5' mb={1} mt={3}>
          Social Media Login
        </Typography>
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>WhatsApp</InputLabel>
            <MuiSwitch />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>Facebook</InputLabel>
            <MuiSwitch />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>Google</InputLabel>
            <MuiSwitch />
          </MuiListItem>
          <MuiListItem>
            <InputLabel>Apple Id</InputLabel>
            <MuiSwitch />
          </MuiListItem>
        </MuiBorderBox> */}
          </List>
          {checkPermission('login setting.update') && (
            <MuiListItem>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Button type='button' onClick={handleSubmit(onSubmit)} variant='contained'>
                  {t('Save')}
                </Button>
              </Box>
            </MuiListItem>
          )}
        </>
      )}
    </Box>
  )
}
export default LoginSettingComponent
