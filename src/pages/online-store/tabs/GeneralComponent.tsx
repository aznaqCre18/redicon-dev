import {
  List,
  ListItem,
  InputLabel,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  useTheme,
  Popover
} from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/form/CustomTextField'
import { ImageUpload } from 'src/components/form/ImageUpload'
import {
  GeneralStoreSettingData,
  GeneralStoreSettingSchema
} from 'src/types/apps/vendor/settings/online-store/general'
import { generalStoreSettingService } from 'src/services/vendor/settings/online-store/general'
import { useTranslation } from 'react-i18next'
import { ChromePicker } from 'react-color'
import { Icon } from '@iconify/react'
import { promise } from 'src/utils/promise'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import { useAuth } from 'src/hooks/useAuth'
import { vendorService } from 'src/services/vendor'
import RadioButtonCustom from 'src/components/form/RadioButtonCustom'

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

// const MuiSwitch = styled(Switch)(({ theme }) => ({
//   '& .MuiSwitch-switchBase.Mui-checked': {
//     color: theme.palette.primary.main
//   },
//   margin: 0
// }))

const GeneralComponent = () => {
  const { checkPermission, user } = useAuth()
  const vendorId = user?.user?.vendor_id
  const { t } = useTranslation()
  const theme = useTheme()

  const defaultColors = [
    { color: theme.palette.primary.main },
    { color: theme.palette.error.main },
    { color: theme.palette.warning.main },
    { color: theme.palette.info.main },
    { color: theme.palette.success.main },
    { color: 'custom' }
  ]

  const [imgSrcLogo, setImgSrcLogo] = useState<string | undefined>(undefined)
  const [fileLogo, setFileLogo] = useState<File | null>(null)
  const [imgSrcFavicon, setImgSrcFavicon] = useState<string | undefined>(undefined)
  const [fileFavicon, setFileFavicon] = useState<File | null>(null)

  const [color, setColor] = useState<string>('#000000')

  const [colorCustom, setColorCustom] = useState<string>('#000000')

  const onChaneColorCustom = (color: any) => {
    promise(() => {
      setColorCustom(color.hex)
      setColor('custom')

      setValue('website_color', color.hex)
    })
  }

  const [isCustomDomain, setIsCustomDomain] = useState<boolean>(false)

  const [maintenanceState, setMaintenanceState] = React.useState({
    is_web_maintenance: true,
    is_android_maintenance: false,
    is_ios_maintenance: false
  })

  const handleChangeMaintenance = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaintenanceState({
      ...maintenanceState,
      [event.target.name]: event.target.checked
    })

    setValue(
      event.target.name as 'is_web_maintenance' | 'is_android_maintenance' | 'is_ios_maintenance',
      event.target.checked
    )
  }

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm<GeneralStoreSettingData>({
    mode: 'all',
    resolver: yupResolver(GeneralStoreSettingSchema)
  })

  const queryClient = useQueryClient()

  const vendorData = useQuery('vendor-data', {
    queryFn: () => vendorService.getItem(vendorId!),
    enabled: !!vendorId
  })

  useQuery('store-general-setting', generalStoreSettingService.get, {
    onSuccess: data => {
      setValue('website_color', data.data.data.online_store.website_color ?? '#000000')
      setValue(
        'theme_type',
        data.data.data.online_store.theme_type != '' || data.data.data.online_store.theme_type
          ? data.data.data.online_store.theme_type
          : 'resto'
      )

      setValue('title', data.data.data.online_store.title)
      setValue('slogan', data.data.data.online_store.slogan)
      setValue('email', data.data.data.online_store.email)
      setValue('wa1', data.data.data.online_store.wa1)
      setValue('wa2', data.data.data.online_store.wa2)
      setValue('wa3', data.data.data.online_store.wa3)
      setValue('socmed_fb', data.data.data.online_store.socmed_fb)
      setValue('socmed_x', data.data.data.online_store.socmed_x)
      setValue('socmed_ig', data.data.data.online_store.socmed_ig)
      setValue('socmed_tt', data.data.data.online_store.socmed_tt)
      setValue('socmed_yt', data.data.data.online_store.socmed_yt)
      setValue('socmed_other', data.data.data.online_store.socmed_other)
      setValue('mp_shopee', data.data.data.online_store.mp_shopee)
      setValue('mp_tokopedia', data.data.data.online_store.mp_tokopedia)
      setValue('mp_olx', data.data.data.online_store.mp_olx)
      setValue('mp_blibli', data.data.data.online_store.mp_blibli)
      setValue('mp_bukalapak', data.data.data.online_store.mp_bukalapak)
      setValue('mp_other', data.data.data.online_store.mp_other)
      setValue('mp_lazada', data.data.data.online_store.mp_lazada)
      setValue('url_playstore', data.data.data.online_store.url_playstore)
      setValue('url_appstore', data.data.data.online_store.url_appstore)
      setValue('is_web_maintenance', data.data.data.online_store.is_web_maintenance || false)
      setValue(
        'is_android_maintenance',
        data.data.data.online_store.is_android_maintenance || false
      )
      setValue('is_ios_maintenance', data.data.data.online_store.is_ios_maintenance || false)
      setValue('maintenance_text', data.data.data.online_store.maintenance_text)

      setValue('country_id', data.data.data.online_store.country_id)
      setValue('province_id', data.data.data.online_store.province_id)
      setValue('district_id', data.data.data.online_store.district_id)
      setValue('subdistrict_id', data.data.data.online_store.subdistrict_id)
      setValue('address', data.data.data.online_store.address)
      // set logo
      if (data.data.data.online_store.logo) {
        setImgSrcLogo(getImageAwsUrl(data.data.data.online_store.logo))
      }

      if (data.data.data.online_store.favicon) {
        setImgSrcFavicon(getImageAwsUrl(data.data.data.online_store.favicon))
      }

      // set color
      const isColorExist = defaultColors.find(
        item => item.color == data.data.data.online_store.website_color ?? '#000000'
      )
      if (!isColorExist) {
        setColor('custom')
        setColorCustom(data.data.data.online_store.website_color ?? '#000000')
      } else {
        setColor(data.data.data.online_store.website_color ?? '#000000')
        setColorCustom(theme.palette.secondary.main)
      }

      // set maintenance
      setMaintenanceState({
        is_android_maintenance: data.data.data.online_store.is_android_maintenance,
        is_ios_maintenance: data.data.data.online_store.is_ios_maintenance,
        is_web_maintenance: data.data.data.online_store.is_web_maintenance
      })
    }
  })

  const { mutate } = useMutation(generalStoreSettingService.update, {
    onSuccess: data => {
      toast.success(t(data.data.message))
      queryClient.invalidateQueries('store-general-setting')

      if (fileLogo) {
        uploadLogo(fileLogo)
      }

      if (fileFavicon) {
        uploadFavicon(fileFavicon)
      }
    }
  })

  const { mutate: uploadLogo } = useMutation(generalStoreSettingService.uploadMediaLogo, {
    onSuccess: () => {
      queryClient.invalidateQueries('store-general-setting')
    }
  })

  const { mutate: uploadFavicon } = useMutation(generalStoreSettingService.uploadMediaFavicon, {
    onSuccess: () => {
      queryClient.invalidateQueries('store-general-setting')
    }
  })

  const onSubmit = (data: GeneralStoreSettingData) => {
    mutate({
      ...data
    })
  }

  // color picker
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClickChangeColor = (color: string) => {
    setValue('website_color', color)

    setColor(color)
  }

  const handleClickCustomColor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  useEffect(() => {
    console.log('error validation', errors)
  }, [errors])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      {checkPermission('general.read') && (
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
            <MuiBorderBox>
              <MuiListItem>
                <InputLabel>{t('Logo Website')}</InputLabel>
                <Box display={'flex'}>
                  <ImageUpload
                    imagePreview={imgSrcLogo}
                    onChange={setFileLogo}
                    onDelete={() => setFileLogo(null)}
                    label='480 x 320'
                    size={{
                      width: 144,
                      height: 96
                    }}
                  />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    <ImageUpload
                      imagePreview={imgSrcFavicon}
                      onChange={setFileFavicon}
                      onDelete={() => setFileFavicon(null)}
                      label='32 x 32'
                      size={{
                        width: 64,
                        height: 64
                      }}
                    />
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        mb: 2
                      }}
                    >
                      Favicon
                    </Typography>
                  </Box>
                </Box>
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>{t('Website Color')}</InputLabel>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {defaultColors.map((item, index) =>
                    item.color != 'custom' ? (
                      <Box
                        component={Button}
                        key={index}
                        sx={{
                          padding: 2,
                          border: item.color == color ? 2 : undefined,
                          borderRadius: 1,
                          backgroundColor: 'unset',
                          borderColor:
                            item.color == color ? theme.palette.primary.main : theme.palette.divider
                        }}
                        variant='outlined'
                        onClick={() => handleClickChangeColor(item.color)}
                      >
                        <Box
                          sx={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: item.color,
                            borderRadius: 1
                          }}
                        ></Box>
                      </Box>
                    ) : (
                      <Box
                        component={Button}
                        key={index}
                        sx={{
                          padding: 2,
                          border: item.color == color ? 2 : undefined,
                          borderRadius: 1,
                          backgroundColor: 'unset',
                          borderColor:
                            item.color == color ? theme.palette.primary.main : theme.palette.divider
                        }}
                        aria-describedby={'color-popover'}
                        variant='outlined'
                        onClick={handleClickCustomColor}
                      >
                        <Box
                          sx={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: colorCustom,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                            // color: theme.palette.getContrastText(colorCustom)
                          }}
                        >
                          <Icon icon='gravity-ui:pencil' fontSize={24} />
                        </Box>
                      </Box>
                    )
                  )}
                  <Popover
                    id={'color-popover'}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left'
                    }}
                  >
                    <ChromePicker color={colorCustom} onChange={onChaneColorCustom} />
                  </Popover>
                </Box>
              </MuiListItem>

              <MuiListItem>
                <InputLabel>{t('Web Order Theme')}</InputLabel>
                <Controller
                  name='theme_type'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioButtonCustom
                      value={field.value ?? 'resto'}
                      sx={{
                        ml: 3
                      }}
                      options={[
                        { value: 'resto', label: t('Resto') },
                        { value: 'online_store', label: t('Store') }
                      ]}
                      onChange={value => {
                        field.onChange(value.value)
                      }}
                    />
                  )}
                />
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>Website</InputLabel>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    sx={{
                      width: '300px'
                    }}
                    value={vendorData.data?.data.data.website}
                    size='small'
                    InputProps={{
                      readOnly: true
                      // startAdornment: <InputAdornment position='start'>https://</InputAdornment>
                      //   endAdornment: !isCustomDomain || vendorData.data?.data.data.website.includes ? (
                      //     <InputAdornment position='end'>.motapos.id</InputAdornment>
                      //   ) : undefined
                    }}
                  />
                  <Button
                    disabled
                    variant='outlined'
                    onClick={() => setIsCustomDomain(!isCustomDomain)}
                  >
                    {!isCustomDomain ? 'Use Custom Domain' : 'Use Default Domain'}
                  </Button>
                </Box>
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>{t('Website Title')}</InputLabel>
                <Controller
                  name='title'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      error={Boolean(errors.title)}
                      {...(errors.title && { helperText: errors.title.message })}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>{t('Slogan')}</InputLabel>
                <Controller
                  name='slogan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      error={Boolean(errors.slogan)}
                      {...(errors.slogan && { helperText: errors.slogan.message })}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>Email</InputLabel>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      error={Boolean(errors.email)}
                      {...(errors.email && { helperText: errors.email.message })}
                    />
                  )}
                />
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>{t('WhatsApp Bussines')}</InputLabel>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Controller
                      name='wa1'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='WhatsApp 1'
                          fullWidth
                          error={Boolean(errors.wa1)}
                          {...(errors.wa1 && { helperText: errors.wa1.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='wa2'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='WhatsApp 2'
                          fullWidth
                          error={Boolean(errors.wa2)}
                          {...(errors.wa2 && { helperText: errors.wa2.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='wa3'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='WhatsApp 3'
                          fullWidth
                          error={Boolean(errors.wa3)}
                          {...(errors.wa3 && { helperText: errors.wa3.message })}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>{t('District')}</InputLabel>
                <CustomTextField name='store_name' fullWidth value={''} />
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1,
                  alignItems: 'flex-start'
                }}
              >
                <InputLabel>{t('Address')}</InputLabel>
                <Controller
                  name='address'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      placeholder={t('Address') ?? 'Address'}
                      fullWidth
                      error={Boolean(errors.address)}
                      {...(errors.address && { helperText: errors.address.message })}
                    />
                  )}
                />
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1,
                  alignItems: 'flex-start'
                }}
              >
                <InputLabel>{t('Social Media')}</InputLabel>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Controller
                      name='socmed_fb'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.facebook.com/'}
                          fullWidth
                          error={Boolean(errors.socmed_fb)}
                          {...(errors.socmed_fb && { helperText: errors.socmed_fb.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='socmed_ig'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.instagram.com/'}
                          fullWidth
                          error={Boolean(errors.socmed_ig)}
                          {...(errors.socmed_ig && { helperText: errors.socmed_ig.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='socmed_x'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.x.com/'}
                          fullWidth
                          error={Boolean(errors.socmed_x)}
                          {...(errors.socmed_x && { helperText: errors.socmed_x.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='socmed_tt'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.tiktok.com/'}
                          fullWidth
                          error={Boolean(errors.socmed_tt)}
                          {...(errors.socmed_tt && { helperText: errors.socmed_tt.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='socmed_yt'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.youtube.com/'}
                          fullWidth
                          error={Boolean(errors.socmed_yt)}
                          {...(errors.socmed_yt && { helperText: errors.socmed_yt.message })}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <Controller
                      name='socmed_other'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={t('Other Social Media') ?? 'Other Social Media'}
                          fullWidth
                          error={Boolean(errors.socmed_other)}
                          {...(errors.socmed_other && { helperText: errors.socmed_other.message })}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </MuiListItem>
              <MuiListItem
                sx={{
                  marginTop: 1,
                  alignItems: 'flex-start'
                }}
              >
                <InputLabel>{t('Market Place')}</InputLabel>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_shopee'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={'https://www.shopee.com/'}
                          fullWidth
                          error={Boolean(errors.mp_shopee)}
                          {...(errors.mp_shopee && { helperText: errors.mp_shopee.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_tokopedia'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='https://www.tokopedia.com/'
                          fullWidth
                          error={Boolean(errors.mp_tokopedia)}
                          {...(errors.mp_tokopedia && { helperText: errors.mp_tokopedia.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_olx'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='https://www.olx.com/'
                          fullWidth
                          error={Boolean(errors.mp_olx)}
                          {...(errors.mp_olx && { helperText: errors.mp_olx.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_blibli'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='https://www.blibli.com/'
                          fullWidth
                          error={Boolean(errors.mp_blibli)}
                          {...(errors.mp_blibli && { helperText: errors.mp_blibli.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_bukalapak'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder='https://www.bukalapak.com/'
                          fullWidth
                          error={Boolean(errors.mp_bukalapak)}
                          {...(errors.mp_bukalapak && { helperText: errors.mp_bukalapak.message })}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Controller
                      name='mp_other'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          placeholder={t('Other Market Place') ?? 'Other Market Place'}
                          fullWidth
                          error={Boolean(errors.mp_other)}
                          {...(errors.mp_other && { helperText: errors.mp_other.message })}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>Play Store (Android)</InputLabel>
                <Controller
                  name='url_playstore'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      placeholder='https://play.googl.ecom/store/apps/details?id=xxxx'
                      fullWidth
                      error={Boolean(errors.url_playstore)}
                      {...(errors.url_playstore && { helperText: errors.url_playstore.message })}
                    />
                  )}
                />
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>App Store (iOS)</InputLabel>
                <Controller
                  name='url_appstore'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      placeholder='https://apps.apple.com/tt/app/xxxxx/xxxx'
                      fullWidth
                      error={Boolean(errors.url_appstore)}
                      {...(errors.url_appstore && { helperText: errors.url_appstore.message })}
                    />
                  )}
                />
              </MuiListItem>

              <MuiListItem
                sx={{
                  marginTop: 1
                }}
              >
                <InputLabel>Maintenance</InputLabel>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={maintenanceState.is_web_maintenance}
                        onChange={handleChangeMaintenance}
                        name='is_web_maintenance'
                      />
                    }
                    label='Website'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={maintenanceState.is_android_maintenance}
                        onChange={handleChangeMaintenance}
                        name='is_android_maintenance'
                      />
                    }
                    label='Android'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={maintenanceState.is_ios_maintenance}
                        onChange={handleChangeMaintenance}
                        name='is_ios_maintenance'
                      />
                    }
                    label='iOS'
                  />
                </Box>
              </MuiListItem>

              {(maintenanceState.is_web_maintenance ||
                maintenanceState.is_android_maintenance ||
                maintenanceState.is_ios_maintenance) && (
                <MuiListItem
                  sx={{
                    alignItems: 'flex-start'
                  }}
                >
                  <InputLabel></InputLabel>
                  <Box mb={2}>
                    <Controller
                      name='maintenance_text'
                      control={control}
                      render={({ field: { value, ...field } }) => (
                        <TextField
                          sx={{
                            '& .MuiInputBase-root': {
                              padding: 2,
                              paddingLeft: 3,
                              paddingRight: 3
                            }
                          }}
                          multiline
                          rows={4}
                          fullWidth
                          {...field}
                          value={value}
                        />
                      )}
                    />
                  </Box>
                </MuiListItem>
              )}
            </MuiBorderBox>
          </List>
          {checkPermission('general.update') && (
            <List
              sx={{
                padding: 0,
                margin: 0,
                '& .MuiListItem-root': {
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: 'min(280px) 1fr',
                  padding: 0,
                  margin: 0
                }
              }}
            >
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
            </List>
          )}
        </>
      )}
    </Box>
  )
}
export default GeneralComponent
