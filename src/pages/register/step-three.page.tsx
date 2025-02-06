// ** Config
import authConfig from 'src/configs/auth'

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useMutation, useQuery } from 'react-query'
import { vendorService } from 'src/services/vendor'
import { Icon } from '@iconify/react'
import { VendorRegistrationData, registerSchema } from 'src/types/apps/vendorType'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { locationService } from 'src/services/location'
import { SubDistrictDetailType } from 'src/types/apps/locationType'
import { BusinessType, businessTypeService } from 'src/services/bussinesType'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import toast from 'react-hot-toast'
import { decrypt } from 'src/utils/cryptoUtils'
import { devMode } from 'src/configs/dev'
import { useApp } from 'src/hooks/useApp'
import { formatPhone } from 'src/utils/numberUtils'

const StepThreePage = () => {
  const { errorInput } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cardType, setCardType] = useState<'setPassword' | 'setBusiness'>('setPassword')

  const data = searchParams.get('data')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [methodVerification, setMethodVerification] = useState<'phone' | 'email'>('phone')

  const [business, setBusiness] = useState<BusinessType[]>([])
  const [subDistricts, setSubDistricts] = useState<SubDistrictDetailType[]>([])

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false)

  useQuery(['list-business-type'], {
    queryFn: () => businessTypeService.getList(maxLimitPagination),
    onSuccess: data => {
      setBusiness(data.data.data ?? [])
    }
  })

  // ** query subdistricts
  const { mutate: getSubDistrict } = useMutation(locationService.getSubDistrict, {
    onSuccess: data => {
      setSubDistricts(data.data.data ?? [])
    }
  })

  const { mutate: register, isLoading: loadingSubmit } = useMutation(vendorService.registration, {
    onSuccess: data => {
      window.localStorage.setItem(
        authConfig.storageTokenKeyName,
        'Bearer ' + data.data.data.token.access_token
      )

      window.localStorage.setItem(
        'userData',
        JSON.stringify({ ...data.data.data.user, role: 'admin', superadmin: true })
      )

      window.location.href = '/'
    }
  })

  const { handleSubmit, control, formState, setValue, getValues } = useForm<VendorRegistrationData>(
    {
      defaultValues: {
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
      },
      mode: 'all',
      resolver: yupResolver(registerSchema)
    }
  )

  useEffect(() => {
    if (data) {
      const dataDecoded = decrypt(data)
      try {
        const dataParsed = JSON.parse(dataDecoded)

        setEmail(dataParsed.email)
        setPhone(dataParsed.phone)
        setMethodVerification(dataParsed.methodVerification)
      } catch (error) {
        toast.error('Data tidak valid')
        router.push('/register')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (email) setValue('email', email)
    if (phone) setValue('phone', phone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone])

  const onSubmit = (data: VendorRegistrationData) => {
    register(data)
  }

  const onSubmitSetPassword = () => {
    if (
      Boolean(formState.errors.password) ||
      Boolean(formState.errors.password_confirmation) ||
      !getValues().password ||
      !getValues().password_confirmation
    )
      return

    setCardType('setBusiness')
  }

  // useEffect(() => {
  //   const data = response
  //   window.localStorage.setItem(
  //     authConfig.storageTokenKeyName,
  //     'Bearer ' + data.data.token.access_token
  //   )

  //   window.localStorage.setItem('userData', JSON.stringify({ ...data.data.user, role: 'admin' }))

  //   window.location.href = '/'
  // }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        placeContent: 'center',
        placeItems: 'center'
      }}
    >
      <Box
        width={400}
        sx={{
          textAlign: 'center'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card
            sx={{
              display: cardType === 'setPassword' ? undefined : 'none'
            }}
          >
            <CardContent>
              <Typography variant='h1' color={'primary'} mb={4}>
                Gabung dengan {devMode ? 'Shopi' : 'MotaPos'} Sekarang!
              </Typography>

              <Typography variant='body1'>
                Mulailah perjalanan bisnis Anda bersama {devMode ? 'Shopi' : 'MotaPos'}.
              </Typography>
              <Grid container spacing={4} mt={4} textAlign={'left'}>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='email'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        disabled
                        fullWidth
                        label='Email'
                        variant='outlined'
                        type='email'
                        size='small'
                        {...errorInput(formState.errors, 'email')}
                        InputProps={{
                          ...(methodVerification === 'email'
                            ? {
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <Icon icon={'bi:check'} fontSize={18} color='green' />
                                  </InputAdornment>
                                )
                              }
                            : {})
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='phone'
                    render={({ field: { onChange, ...field } }) => (
                      <TextField
                        disabled
                        {...field}
                        onChange={e => {
                          const value = formatPhone(e.target.value)
                          onChange(value)
                        }}
                        fullWidth
                        label='No WhatsApp'
                        variant='outlined'
                        type='tel'
                        size='small'
                        {...errorInput(formState.errors, 'phone')}
                        InputProps={{
                          inputMode: 'tel',
                          ...(methodVerification === 'phone'
                            ? {
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <Icon icon={'bi:check'} fontSize={18} color='green' />
                                  </InputAdornment>
                                )
                              }
                            : {})
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='password'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Kata Sandi'
                        variant='outlined'
                        type={showPassword ? 'text' : 'password'}
                        size='small'
                        error={Boolean(formState.errors.password)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <Icon
                                  fontSize='1.25rem'
                                  icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'}
                                />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                  <Box mt={2} mb={2} display={'flex'} flexDirection={'column'} rowGap={2}>
                    <Box display={'flex'} alignItems={'center'} columnGap={2}>
                      <Icon
                        icon={getValues().password.length >= 8 ? 'bi:check' : 'bi:x'}
                        fontSize={18}
                        color='white'
                        style={{
                          backgroundColor: getValues().password.length >= 8 ? 'green' : 'red',
                          borderRadius: '50%'
                        }}
                      />
                      <Typography>Kata Sandi Minimal 8-20 karakter</Typography>
                    </Box>
                    <Box
                      display={'flex'}
                      alignItems={'center'}
                      sx={{
                        columnGap: 2
                      }}
                    >
                      <Icon
                        icon={getValues().password.match(/\W+/) ? 'bi:check' : 'bi:x'}
                        fontSize={18}
                        color='white'
                        style={{
                          backgroundColor: getValues().password.match(/\W+/) ? 'green' : 'red',
                          borderRadius: '50%'
                        }}
                      />
                      <Typography>Mengandung min. 1 huruf, angka dan simbol (!@#$%)</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='password_confirmation'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Ulangi Kata Sandi'
                        variant='outlined'
                        type={showPasswordConfirm ? 'text' : 'password'}
                        size='small'
                        {...errorInput(formState.errors, 'password_confirmation')}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                              >
                                <Icon
                                  fontSize='1.25rem'
                                  icon={showPasswordConfirm ? 'tabler:eye' : 'tabler:eye-off'}
                                />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} textAlign={'center'}>
                  <Typography variant='body2'>
                    Dengan mendaftar, saya menyetujui{' '}
                    <Typography
                      color={'primary'}
                      sx={{
                        textDecoration: 'unset',
                        ':hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      component={Link}
                      href={'/syarat-ketentuan'}
                      target='_blank'
                    >
                      Syarat & Ketentuan
                    </Typography>{' '}
                    dan{' '}
                    <Typography
                      color={'primary'}
                      sx={{
                        textDecoration: 'unset',
                        ':hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      component={Link}
                      href={'/kebijakan-privasi'}
                      target='_blank'
                    >
                      Kebijakan Privasi
                    </Typography>{' '}
                    dari {devMode ? 'Shopi' : 'Motapos'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={onSubmitSetPassword}
                    fullWidth
                    variant='contained'
                    sx={{
                      mt: 3
                    }}
                    type='button'
                  >
                    Daftar
                  </Button>
                </Grid>
              </Grid>
              <Divider
                sx={{
                  mt: 4,
                  mb: 4
                }}
              />
              <Button
                fullWidth
                size='small'
                variant='outlined'
                sx={{
                  mt: 3
                }}
                onClick={() => {
                  router.push('/register')
                }}
                startIcon={<Icon icon='mingcute:left-fill' />}
              >
                Kembali
              </Button>
            </CardContent>
          </Card>
          <Card
            sx={{
              display: cardType === 'setBusiness' ? undefined : 'none'
            }}
          >
            <CardContent>
              <Typography variant='body1'>
                Langkah terakhir! Yuk infokan data usaha kamu{' '}
              </Typography>
              <Grid container spacing={4} mt={4} textAlign={'left'}>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nama Pemilik Usaha'
                        variant='outlined'
                        size='small'
                        {...errorInput(formState.errors, 'name')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='vendor_name'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nama Usaha'
                        variant='outlined'
                        size='small'
                        {...errorInput(formState.errors, 'vendor_name')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='business_type_id'
                    render={({ field }) => (
                      <SelectCustom
                        isFloating
                        {...field}
                        fullWidth
                        options={business}
                        label='Jenis Usaha'
                        optionKey={'id'}
                        labelKey={'title'}
                        onSelect={value => value && field.onChange(value.id)}
                        {...errorInput(formState.errors, 'business_type_id')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='subdistrict_id'
                    render={({ field }) => (
                      <SelectCustom
                        serverSide
                        {...field}
                        options={subDistricts}
                        onInputChange={(event, value: string) => {
                          if (value)
                            getSubDistrict({
                              query: value,
                              limit: 100,
                              page: 1
                            })
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
                        label='Kecamatan'
                        {...errorInput(formState.errors, 'subdistrict_id')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='address'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={2}
                        fullWidth
                        label='Alamat'
                        variant='outlined'
                        size='small'
                        {...errorInput(formState.errors, 'address')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button disabled={loadingSubmit} fullWidth variant='contained' type='submit'>
                    Selesai
                  </Button>
                </Grid>
              </Grid>
              <Divider
                sx={{
                  mt: 4,
                  mb: 4
                }}
              />
              <Button
                fullWidth
                size='small'
                variant='outlined'
                sx={{
                  mt: 3
                }}
                onClick={() => {
                  setCardType('setPassword')
                }}
                startIcon={<Icon icon='mingcute:left-fill' />}
              >
                Kembali
              </Button>
            </CardContent>
          </Card>
        </form>
      </Box>
    </Box>
  )
}

StepThreePage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

StepThreePage.guestGuard = true

export default StepThreePage
