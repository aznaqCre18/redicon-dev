import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid, InputAdornment, TextField, Typography, styled } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import { ImageUpload } from 'src/components/form/ImageUpload'
import { BusinessType, businessTypeService } from 'src/services/bussinesType'
import { dashboardProfileService } from 'src/services/dashboard/profile'
import { locationService } from 'src/services/location'
import { ProfileData, ProfileSchema, ProfileType } from 'src/types/apps/dashboard/profile'
import { SubDistrictDetailType } from 'src/types/apps/locationType'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { getImageAwsUrl } from 'src/utils/imageUtils'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import { useApp } from 'src/hooks/useApp'
import { vendorService } from 'src/services/vendor'
import { Icon } from '@iconify/react'

const GridLabel = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '5px'
}))

const BusinessDetail = () => {
  const { errorInput } = useApp()
  const { initAuth, user } = useAuth()
  const vendorId = user?.user.vendor_id

  const { t } = useTranslation()
  const [isCustomDomain, setIsCustomDomain] = useState<boolean>(false)
  const [profileData, setProfileData] = useState<ProfileType>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [business, setBusiness] = useState<BusinessType[]>([])
  const [subDistricts, setSubDistricts] = useState<SubDistrictDetailType[]>([])

  const [editEmail, setEditEmail] = useState<boolean>(false)
  const [editWa1, setEditWa1] = useState<boolean>(false)

  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined)
  const [files, setFiles] = useState<File | null>(null)

  const { handleSubmit, control, setValue, formState } = useForm<ProfileData>({
    mode: 'all',
    resolver: yupResolver(ProfileSchema)
  })

  const vendorData = useQuery('vendor-data', {
    queryFn: () => vendorService.getItem(vendorId!),
    enabled: !!vendorId
  })

  const { isLoading: isLoadingDashboardProfile } = useQuery(
    'dashboard-profile',
    dashboardProfileService.get,
    {
      onSuccess: data => {
        setProfileData(data.data.data)
      },
      retry: 0
    }
  )

  useQuery(['list-business-type'], {
    queryFn: () => businessTypeService.getList(maxLimitPagination),
    onSuccess: data => {
      setBusiness(data.data.data ?? [])
    }
  })

  // ** query subdistricts
  const { mutate: getSubDistrict } = useMutation(locationService.getSubDistrict, {
    onSuccess: data => {
      if (data.data.data) {
        setSubDistricts(data.data.data ?? [])
      }
    }
  })

  const { mutate: updateLogo, isLoading: loadingUpdateLogo } = useMutation(
    dashboardProfileService.updateLogo,
    {
      onSuccess: data => {
        toast.success(t(data.data.message))
        initAuth()
      }
    }
  )

  const { mutate: getOneSubDisctrict, isLoading: loadingDetailSubDistrict } = useMutation(
    locationService.getOneSubDistrict,
    {
      onSuccess: data => {
        setSubDistricts([data.data.data])

        setValue('subdistrict_id', data.data.data.subdistrict_id)
      }
    }
  )

  const { mutate: updateProfile, isLoading: loadingUpdateProfile } = useMutation(
    dashboardProfileService.update,
    {
      onSuccess: data => {
        if (files) {
          updateLogo(files)
        } else {
          initAuth()
          toast.success(t(data.data.message))
        }
      }
    }
  )

  const onSubmit = (data: ProfileData) => {
    updateProfile(data)
  }

  useEffect(() => {
    if (profileData) {
      if (profileData.subdistrict_id) {
        getOneSubDisctrict(profileData.subdistrict_id)
      }

      console.log('profileData', profileData.wa1)

      setValue('vendor_name', profileData.vendor_name)
      setValue('abbreviation', profileData.abbreviation)
      setValue('address', profileData.address)
      // setValue('business_type_id', profileData.business_type_id)
      setValue('district_id', profileData.district_id)
      setValue('province_id', profileData.province_id)
      setValue('country_id', profileData.country_id)
      // setValue('email', profileData.email)
      // setValue('wa1', profileData.wa1)
      setValue('wa2', profileData.wa2)
      setValue('wa3', profileData.wa3)

      if (profileData.logo != '') {
        setImgSrc(getImageAwsUrl(profileData.logo))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData])

  return (
    <>
      {!isLoadingDashboardProfile && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Business Logo')}</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              <ImageUpload
                imagePreview={imgSrc}
                onChange={setFiles}
                label='1 : 1'
                size={{
                  width: 100,
                  height: 100
                }}
              />
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Business Name')}</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              <Controller
                control={control}
                name='vendor_name'
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    {...field}
                    size='small'
                    fullWidth
                    {...errorInput(formState.errors, 'vendor_name')}
                  />
                )}
              />
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Singkatan')}</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              <Controller
                control={control}
                name='abbreviation'
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <TextField
                    value={value ?? ''}
                    {...field}
                    size='small'
                    fullWidth
                    {...errorInput(formState.errors, 'abbreviation')}
                  />
                )}
              />
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Business Type')}</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              <TextField
                value={profileData?.business_type?.title}
                size='small'
                fullWidth
                disabled
              />
              {/* <Controller
                control={control}
                name='business_type_id'
                render={({ field }) => (
                  <SelectCustom
                    serverSide
                    isFloating
                    {...field}
                    fullWidth
                    options={business}
                    optionKey={'id'}
                    labelKey={'title'}
                    onSelect={value => value && field.onChange(value.id)}
                    {...errorInput(formState.errors, 'business_type_id')}
                  />
                )}
              /> */}
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Business Email')}</Typography>
              <Box
                sx={{
                  backgroundColor: 'green',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  ml: 2
                }}
              >
                <Icon icon={'bi:check'} fontSize={18} />
              </Box>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              {!editEmail ? (
                <TextField
                  value={profileData?.email}
                  size='small'
                  fullWidth
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Typography
                          className='hover-underline'
                          color={'primary.main'}
                          onClick={() => {
                            setValue('email', profileData?.email ?? '')
                            setEditEmail(true)
                          }}
                        >
                          {t('Edit')}
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <Controller
                  control={control}
                  name='email'
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      value={value ?? ''}
                      {...field}
                      size='small'
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            {value !== profileData?.email && (
                              <Button
                                type='button'
                                sx={{ textTransform: 'capitalize', mr: 2, p: 1 }}
                                variant='contained'
                                size='small'
                              >
                                {t('Verify')}
                              </Button>
                            )}

                            <Typography
                              className='hover-underline'
                              color={'primary.main'}
                              onClick={() => {
                                setEditEmail(false)
                              }}
                            >
                              {t('Cancel')}
                            </Typography>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              )}
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Business WhatsApp')}</Typography>
              {profileData?.wa1 && (
                <Box
                  sx={{
                    backgroundColor: 'green',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    ml: 2
                  }}
                >
                  <Icon icon={'bi:check'} fontSize={18} />
                </Box>
              )}
            </GridLabel>
            <Grid item xs={12} sm={3}>
              {profileData?.wa1 && !editWa1 ? (
                <TextField
                  label='WhatsApp 1'
                  value={profileData?.wa1}
                  size='small'
                  fullWidth
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Typography
                          className='hover-underline'
                          color={'primary.main'}
                          onClick={() => {
                            setEditWa1(true)
                            setValue('wa1', profileData?.wa1 ?? '')
                          }}
                        >
                          {t('Edit')}
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <Controller
                  control={control}
                  name='wa1'
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      type='number'
                      label='WhatsApp 1'
                      value={value ?? ''}
                      {...field}
                      size='small'
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            {value !== profileData?.wa1 && (
                              <Button
                                type='button'
                                sx={{ textTransform: 'capitalize', mr: 2, p: 1 }}
                                variant='contained'
                                size='small'
                              >
                                {t('Verify')}
                              </Button>
                            )}

                            <Typography
                              className='hover-underline'
                              color={'primary.main'}
                              onClick={() => setEditWa1(false)}
                            >
                              {value !== profileData?.wa1 ? 'X' : t('Cancel')}
                            </Typography>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                control={control}
                name='wa2'
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <TextField
                    type='number'
                    label='WhatsApp 2'
                    value={value ?? ''}
                    {...field}
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                control={control}
                name='wa3'
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <TextField
                    type='number'
                    label='WhatsApp 3'
                    value={value ?? ''}
                    {...field}
                    size='small'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>Kota/Kecamatan</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              {!loadingDetailSubDistrict && (
                <Controller
                  control={control}
                  name='subdistrict_id'
                  render={({ field }) => (
                    <SelectCustom
                      serverSide
                      {...field}
                      options={subDistricts}
                      onInputChange={(event, value: string) => {
                        if (value && event?.type === 'change') {
                          getSubDistrict({
                            query: value,
                            limit: 100,
                            page: 1
                          })
                        } else if (event && value == '') {
                          setSubDistricts([])
                        }
                      }}
                      renderLabel={options => {
                        if (!options) return ''

                        return (
                          options.subdistrict_name +
                          ', ' +
                          options.district_name +
                          ', ' +
                          options.province_name
                        )
                      }}
                      labelKey={'subdistrict_name'}
                      optionKey={'id'}
                      onSelect={value => {
                        if (value) {
                          field.onChange(value.id)
                          setValue('district_id', value.district_id)
                          setValue('province_id', value.province_id)
                          setValue('country_id', 62)
                        }
                      }}
                      isFloating
                      fullWidth
                      {...errorInput(formState.errors, 'subdistrict_id')}
                    />
                  )}
                />
              )}
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>{t('Address')}</Typography>
            </GridLabel>
            <Grid item xs={12} sm={9}>
              <Controller
                control={control}
                name='address'
                render={({ field: { value, ...field } }) => (
                  <TextField
                    {...field}
                    value={value ?? ''}
                    multiline
                    fullWidth
                    size='small'
                    {...errorInput(formState.errors, 'address')}
                  />
                )}
              />
            </Grid>
            <GridLabel item xs={12} sm={3}>
              <Typography variant='body1'>Website</Typography>
            </GridLabel>
            <Grid
              item
              xs={12}
              sm={9}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2
              }}
            >
              <TextField
                sx={{
                  width: '300px'
                }}
                value={vendorData.data?.data.data.website}
                size='small'
                InputProps={{
                  readOnly: true
                  // startAdornment: <InputAdornment position='start'>https://</InputAdornment>,
                  // endAdornment: !isCustomDomain ? (
                  //   <InputAdornment position='end'>.motapos.id</InputAdornment>
                  // ) : undefined
                }}
              />
              <Button
                disabled
                variant='outlined'
                onClick={() => setIsCustomDomain(!isCustomDomain)}
              >
                {!isCustomDomain ? 'Use Custom Domain' : 'Use Default Domain'}
              </Button>
            </Grid>
            <GridLabel item xs={12} sm={3}></GridLabel>
            <Grid item xs={12} sm={9}>
              <Button
                type='submit'
                variant='contained'
                disabled={loadingUpdateLogo || loadingUpdateProfile}
              >
                {t('Save')}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  )
}

export default BusinessDetail
