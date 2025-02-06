import { List, ListItem, InputLabel, Button, Switch, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import {
  StoreSettingApplicationData,
  StoreSettingApplicationSchema,
  StoreSettingApplicationType
} from 'src/types/apps/vendor/settings/store'
import { useMutation, useQuery } from 'react-query'
import { storeSettingService } from 'src/services/vendor/settings/store'
import toast from 'react-hot-toast'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'

const MuiListItem = styled(ListItem)(({}) => ({
  padding: 0
}))

const MuiSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main
  },
  margin: 0
}))

const UpdateInformationComponent = () => {
  const { checkPermission } = useAuth()

  const { t } = useTranslation()

  const [apkFile, setApkFile] = useState<File | null>(null)
  const [filename, setFilename] = useState<string>('')

  const [storeSetting, setStoreSetting] = useState<StoreSettingApplicationType>()

  useQuery('store-update-setting', storeSettingService.application, {
    onSuccess: data => {
      setStoreSetting(data.data.data)
    }
  })

  const { mutate: updateStoreSetting } = useMutation(storeSettingService.updateApplication, {
    onSuccess: data => {
      toast.success(t(data.data.message))
    }
  })

  const { mutate: uploadApk } = useMutation(storeSettingService.updateApplicationFile, {
    onSuccess: () => {
      toast.success('Upload new APK Success!')
      setApkFile(null)
      setFilename('')
    }
  })

  const { control, handleSubmit, setValue, formState } = useForm<StoreSettingApplicationData>({
    mode: 'all',
    resolver: yupResolver(StoreSettingApplicationSchema)
  })

  const onSubmit = (data: StoreSettingApplicationData) => {
    updateStoreSetting(data)

    if (apkFile) {
      uploadApk(apkFile)
      setFilename('')
      setApkFile(null)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setApkFile(event.target.files[0])
      setFilename(event.target.files[0].name)
    }
  }

  useEffect(() => {
    if (storeSetting) {
      setValue('is_force_update', storeSetting.is_force_update)
      setValue('android_version', storeSetting.android_version)
      setValue('ios_version', storeSetting.ios_version)
      setValue('update_detail', storeSetting.update_detail)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSetting])

  if (!storeSetting) return <div>Loading...</div>

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      {checkPermission('update.read') && (
        <>
          <List
            sx={{
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              '& .MuiListItem-root': {
                display: 'grid',
                gap: 2,
                gridTemplateColumns: 'min(200px) 1fr'
              }
            }}
          >
            <MuiListItem>
              <InputLabel>{t('Force Update')}</InputLabel>
              <MuiSwitch
                defaultChecked={storeSetting.is_force_update}
                onChange={(event, checked) => {
                  setValue('is_force_update', checked)
                }}
              />
            </MuiListItem>

            <MuiListItem>
              <InputLabel>{t('Android Version')}</InputLabel>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: '2fr 1fr'
                }}
              >
                <Controller
                  name='android_version'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      type='number'
                      placeholder='100'
                      error={Boolean(formState.errors.android_version)}
                      helperText={formState.errors.android_version?.message}
                    />
                  )}
                />
                <Box display={'flex'} gap={3} alignItems={'center'}>
                  <Button
                    component={'label'}
                    variant='outlined'
                    startIcon={<Icon icon='tabler:upload' />}
                  >
                    <input type='file' hidden onChange={handleFileChange} accept='.apk,.xapk' />
                    {t('Choose APK')}
                  </Button>
                  {filename ? (
                    <Button
                      color='success'
                      component={'label'}
                      variant='text'
                      startIcon={<Icon icon='tabler:upload' />}
                    >
                      {filename}
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      variant='text'
                      href={getImageAwsUrl(storeSetting.apk)}
                      startIcon={<Icon icon='tabler:download' />}
                    >
                      {t('Download')}
                    </Button>
                  )}
                </Box>
              </Box>
            </MuiListItem>
            <MuiListItem>
              <InputLabel>{t('iOS Version')}</InputLabel>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: '2fr 1fr'
                }}
              >
                <Controller
                  name='ios_version'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      type='number'
                      placeholder='100'
                      error={Boolean(formState.errors.ios_version)}
                      helperText={formState.errors.ios_version?.message}
                    />
                  )}
                />
              </Box>
            </MuiListItem>
            <MuiListItem
              sx={{
                alignItems: 'flex-start'
              }}
            >
              <InputLabel>{t('Update Details')}</InputLabel>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: '2fr 1fr'
                }}
              >
                <Controller
                  name='update_detail'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      rows={7}
                      multiline
                      fullWidth
                      defaultValue='Default Value'
                      id='textarea-outlined-static'
                      error={Boolean(formState.errors.update_detail)}
                      helperText={formState.errors.update_detail?.message}
                    />
                  )}
                />
              </Box>
            </MuiListItem>
          </List>
          <List
            sx={{
              padding: 0,
              margin: 0,
              '& .MuiListItem-root': {
                display: 'grid',
                gap: 2,
                gridTemplateColumns: 'min(200px) 1fr',
                padding: 0,
                margin: 0
              }
            }}
          >
            {checkPermission('update.update') && (
              <MuiListItem>
                <Box />
                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Button variant='contained' onClick={handleSubmit(onSubmit)}>
                    {t('Save')}
                  </Button>
                </Box>
              </MuiListItem>
            )}
          </List>
        </>
      )}
    </Box>
  )
}
export default UpdateInformationComponent
