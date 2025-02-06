import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid, InputLabel, List, ListItem, styled } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import CustomTextField from 'src/@core/components/mui/text-field'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useAuth } from 'src/hooks/useAuth'
import MuiSwitch from 'src/pages/settings/components/Switch'
import { bankService } from 'src/services/bank'
import { vendorSettingPaymentService } from 'src/services/vendor/settings/payment'
import { BankType } from 'src/types/apps/bankType'
import { MootaSettingData } from 'src/types/apps/vendor/settings/payment'
import { MootaSettingSchema, MootaSettingType } from 'src/types/apps/vendor/settings/payment'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { getImageAwsUrl } from 'src/utils/imageUtils'

const MuiListItem = styled(ListItem)(() => ({
  padding: 0,
  alignItems: 'center'
}))

const MuiBorderBox = styled(Box)(() => ({
  // border: `1px solid ${theme.palette.divider}`,
  // borderRadius: theme.shape.borderRadius,
  // padding: theme.spacing(1),
  // paddingLeft: theme.spacing(3),
  // paddingRight: theme.spacing(3),

  display: 'flex',
  flexDirection: 'column',
  gap: 2
}))

const MootaTab = () => {
  const { checkPermission } = useAuth()
  const { t } = useTranslation()

  const [imgSrc, setImgSrc] = useState<string>()

  const [bankList, setBankList] = useState<BankType[]>([])

  const [data, setData] = useState<MootaSettingType>()

  useQuery(['bank-vendor-list'], {
    queryFn: () => bankService.getList(maxLimitPagination),
    onSuccess: data => {
      setBankList(data.data.data ?? [])
    }
  })

  useQuery('moota-settings', vendorSettingPaymentService.getMootaSetting, {
    onSuccess: response => {
      setData(response.data.data)
    }
  })

  const { mutate: updateMootaSetting } = useMutation(
    vendorSettingPaymentService.updateMootaSetting,
    {
      onSuccess: response => {
        toast.success(response.data.message)
      }
    }
  )

  const { handleSubmit, control, setValue } = useForm<MootaSettingData>({
    mode: 'all',
    resolver: yupResolver(MootaSettingSchema)
  })

  const onSubmit = (data: MootaSettingData) => {
    updateMootaSetting(data)
  }

  useEffect(() => {
    if (data) {
      if (data.bank_image) {
        setImgSrc(getImageAwsUrl(data.bank_image))
      }

      setValue('bank_name', data.bank_name)
      setValue('bank_image', data.bank_image)
      setValue('account_number', data.account_number)
      setValue('account_name', data.account_name)
      setValue('moota_secret_key', data.moota_secret_key)
      setValue('moota_bank_id', data.moota_bank_id)
      setValue('status', data.status)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <Box>
      <List
        sx={{
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '& .MuiListItem-root': {
            display: 'grid',
            gridTemplateColumns: 'min(260px) 1fr'
          }
        }}
      >
        <MuiBorderBox>
          <MuiListItem>
            <InputLabel>{t('Bank Transfer Auto Verification')} </InputLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                columnGap: 2
              }}
            >
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <MuiSwitch
                    checked={field.value}
                    onChange={e => {
                      setValue('status', e.target.checked)
                    }}
                  />
                )}
              />
            </Box>
          </MuiListItem>
        </MuiBorderBox>
      </List>
      <Grid container spacing={8}>
        <Grid item xs={8}>
          <List
            sx={{
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '& .MuiListItem-root': {
                display: 'grid',
                gridTemplateColumns: 'min(260px) 1fr'
              }
            }}
          >
            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Select')} Bank</InputLabel>

              <Box>
                <SelectCustom
                  options={bankList}
                  labelKey='name'
                  optionKey={'id'}
                  onSelect={data => {
                    if (data) {
                      setImgSrc(getImageAwsUrl(data.image))

                      setValue('bank_name', data.name)
                      setValue('bank_image', data.image)
                    }
                  }}
                />
              </Box>
            </MuiListItem>

            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Bank Name')}</InputLabel>
              <Controller
                name='bank_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder={t('Bank Name') ?? 'Bank Name'}
                  />
                )}
              />
            </MuiListItem>

            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Account Name')}</InputLabel>
              <Controller
                name='account_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder={t('Account Name') ?? 'Account Name'}
                  />
                )}
              />
            </MuiListItem>

            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Account Number')}</InputLabel>
              <Controller
                name='account_number'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type='number'
                    fullWidth
                    placeholder={t('Account Number') ?? 'Account Number'}
                  />
                )}
              />
            </MuiListItem>

            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Moota Bank ID')}</InputLabel>
              <Controller
                name='moota_bank_id'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder={t('Moota Bank ID') ?? 'Moota Bank ID'}
                  />
                )}
              />
            </MuiListItem>

            <MuiListItem>
              <InputLabel sx={{ mr: 2 }}>{t('Moota Secret Key')}</InputLabel>
              <Controller
                name='moota_secret_key'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder={t('Moota Secret Key') ?? 'Moota Secret Key'}
                  />
                )}
              />
            </MuiListItem>
          </List>
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: 'white',
              display: 'flex',
              width: 200,
              justifyContent: 'center',
              alignItems: 'center',
              margin: 'auto',
              minHeight: 40,
              color: 'black'
            }}
          >
            {imgSrc ? (
              <img
                src={imgSrc}
                style={{ width: '100px', objectFit: 'cover', padding: 8 }}
                alt='Bank Pic'
              />
            ) : (
              <>{t('Bank Logo')}</>
            )}
          </Box>
        </Grid>
      </Grid>

      {checkPermission('setting - payment.update') && (
        <Button variant='contained' sx={{ mt: 4 }} onClick={handleSubmit(onSubmit)}>
          {t('Save')}
        </Button>
      )}
    </Box>
  )
}

export default MootaTab
