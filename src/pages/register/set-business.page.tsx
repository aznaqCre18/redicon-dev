import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import React, { ReactNode, useEffect, useState } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { SubDistrictDetailType } from 'src/types/apps/locationType'
import SelectCustom from 'src/components/form/select/SelectCustom'
import { useMutation, useQuery } from 'react-query'
import { locationService } from 'src/services/location'
import { BusinessType, businessTypeService } from 'src/services/bussinesType'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import { t } from 'i18next'
import { errorInput } from 'src/utils/formUtils'
import toast from 'react-hot-toast'
import { decrypt } from 'src/utils/cryptoUtils'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { RegisterData } from 'src/types/apps/register'
import { registerService } from 'src/services/register'
import { useAuth } from 'src/hooks/useAuth'

const registrationSchema = yup.object<RegisterData>().shape({
  email: yup.string().email().required().label('Email'),
  phone: yup.string().required().label('Phone'),
  password: yup.string().required().label('Password'),
  password_confirmation: yup.string().required().label('Password Confirmation'),
  vendor_name: yup.string().required().label('Nama Vendor'),
  business_type_id: yup.number().required().label('Jenis Usaha'),
  address: yup.string().nullable().label('Alamat'),
  subdistrict_id: yup.number().required().label('Kecamatan'),
  district_id: yup.number().required().label('Kota'),
  province_id: yup.number().required().label('Provinsi'),
  country_id: yup.number().required().label('Negara')
})

const SetBusiness = () => {
  const auth = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const data = searchParams.get('data')

  const [businessType, setBusinessType] = useState<BusinessType[]>([])
  const [subDistricts, setSubDistricts] = useState<SubDistrictDetailType[]>([])

  useQuery(['list-business-type'], {
    queryFn: () => businessTypeService.getList(maxLimitPagination),
    onSuccess: data => {
      setBusinessType(data.data.data ?? [])
    }
  })

  const { handleSubmit, control, formState, setValue, getValues } = useForm<RegisterData>({
    defaultValues: {
      vendor_name: undefined,
      business_type_id: undefined,
      address: '',
      subdistrict_id: undefined,
      district_id: undefined,
      province_id: undefined
    },
    mode: 'all',
    resolver: yupResolver(registrationSchema)
  })

  const login = (user: string, password: string) => {
    auth.login(
      { user: user, password, rememberMe: true },
      err => {
        if (err.code == 'ERR_NETWORK') {
          toast.error(
            'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
          )
        } else if (err.code == 'ECONNABORTED') {
          toast.error('Silakan cek koneksi jaringan anda.')
        } else {
          if ((err.response as any).status == 500) {
            toast.error(
              'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
            )
          } else {
            toast.error(err.message)
          }
        }
      },
      '/dashboard'
    )
  }

  const { mutate: register, isLoading: loadingUpdateProfile } = useMutation(
    registerService.register,
    {
      onSuccess: () => {
        toast.success('Pendaftaran berhasil')
        login(getValues().email, getValues().password)
      }
    }
  )

  const onSubmit = (data: RegisterData) => {
    register(data)
  }

  // ** query subdistricts
  const { mutate: getSubDistrict } = useMutation(locationService.getSubDistrict, {
    onSuccess: data => {
      setSubDistricts(data.data.data ?? [])
    }
  })

  useEffect(() => {
    if (data) {
      const dataDecoded = decrypt(data)
      try {
        const dataParsed = JSON.parse(dataDecoded)

        setValue('email', dataParsed.email)
        setValue('phone', dataParsed.phone.replace('+62', '62'))
        setValue('password', dataParsed.password)
        setValue('password_confirmation', dataParsed.password)
      } catch (error) {
        toast.error('Data tidak valid')
        router.push('/register')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  console.log(formState.errors)

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
        p={4}
        width={400}
        sx={{
          textAlign: 'center'
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h1' color={'primary'} mb={4}>
              Langkah Terakhir
            </Typography>

            <Typography variant='body1'>
              Infokan data bisnis Anda untuk menyelesaikan pendaftran.
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4} mt={4} textAlign={'left'}>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='vendor_name'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nama Bisnis'
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
                        serverSide
                        isFloating
                        label={t('Business Type') ?? 'Business Type'}
                        {...field}
                        fullWidth
                        options={businessType}
                        optionKey={'id'}
                        labelKey={'title'}
                        onSelect={value => value && field.onChange(value.id)}
                        {...errorInput(formState.errors, 'business_type_id')}
                      />
                    )}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='address'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={2}
                        fullWidth
                        label={t('Address') ?? 'Address'}
                        variant='outlined'
                        size='small'
                        {...errorInput(formState.errors, 'address')}
                      />
                    )}
                  />
                </Grid> */}
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
                        label={t('District') ?? 'District'}
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
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant='contained'
                    type='submit'
                    disabled={loadingUpdateProfile}
                  >
                    Selesai
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

SetBusiness.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
SetBusiness.guestGuard = true

export default SetBusiness
