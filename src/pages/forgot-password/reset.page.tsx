/* eslint-disable @typescript-eslint/no-unused-vars */
// ** Config
import authConfig from 'src/configs/auth'

import {
  Box,
  Button,
  Card,
  CardContent,
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
import { useMutation } from 'react-query'
import { Icon } from '@iconify/react'
import { ResetPasswordData, resetPasswordSchema } from 'src/types/apps/vendorType'
import toast from 'react-hot-toast'
import { decrypt } from 'src/utils/cryptoUtils'
import { forgorPasswordService } from 'src/services/forgotPassword'
import { useApp } from 'src/hooks/useApp'
import { useTranslation } from 'react-i18next'

const StepThreePage = () => {
  const { t } = useTranslation()
  const { errorInput } = useApp()

  const router = useRouter()
  const searchParams = useSearchParams()

  const data = searchParams.get('data')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false)

  const { mutate: register } = useMutation(forgorPasswordService.reset, {
    onSuccess: response => {
      toast.success(t(response?.data.message))
      router.push('/login')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message)
    }
  })

  const { handleSubmit, control, formState, setValue, getValues } = useForm<ResetPasswordData>({
    defaultValues: {
      email: '',
      phone: '',
      code: '',
      new_password: '',
      new_password_confirmation: ''
    },
    mode: 'all',
    resolver: yupResolver(resetPasswordSchema)
  })

  useEffect(() => {
    if (data) {
      const dataDecoded = decrypt(data)
      try {
        const dataParsed = JSON.parse(dataDecoded)

        setEmail(dataParsed.email)
        setPhone(dataParsed.phone)
        setCode(dataParsed.code)
      } catch (error) {
        toast.error('Data tidak valid')
        router.push('/forgot-password')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (email) setValue('email', email)
    if (phone) setValue('phone', phone)
    if (code) setValue('code', code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone])

  const onSubmit = (data: ResetPasswordData) => {
    console.log(data)

    register(data)
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
          <Card>
            <CardContent>
              <Typography variant='h3'>Masukan kata sandi baru</Typography>
              <Grid container spacing={4} mt={4} textAlign={'left'}>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='new_password'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Kata Sandi'
                        variant='outlined'
                        type={showPassword ? 'text' : 'password'}
                        size='small'
                        {...errorInput(formState.errors, 'new_password')}
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
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name='new_password_confirmation'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Ulangi Kata Sandi'
                        variant='outlined'
                        type={showPasswordConfirm ? 'text' : 'password'}
                        size='small'
                        {...errorInput(formState.errors, 'new_password_confirmation')}
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

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant='contained'
                    sx={{
                      mt: 3
                    }}
                    type='submit'
                  >
                    Ganti Password
                  </Button>
                </Grid>
              </Grid>
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
