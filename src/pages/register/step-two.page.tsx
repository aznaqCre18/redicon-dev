import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import OtpInput from 'react-otp-input'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import { vendorService } from 'src/services/vendor'
import { Icon } from '@iconify/react'
import { decrypt, encrypt } from 'src/utils/cryptoUtils'
import { useTranslation } from 'react-i18next'
import { errorType } from 'src/types/apps/errorType'
import { Controller, useForm } from 'react-hook-form'
import { FormDataRegisterStepOne, schemaRegister } from './index.page'
import { yupResolver } from '@hookform/resolvers/yup'
import { useApp } from 'src/hooks/useApp'
import { formatPhone } from 'src/utils/numberUtils'

const StepTwoPage = () => {
  const { errorInput } = useApp()
  const { t } = useTranslation()

  const router = useRouter()
  const searchParams = useSearchParams()

  const [isChangePhoneOrEmail, setIsChangePhoneOrEmail] = useState(false)
  const [methodVerification, setMethodVerification] = useState<'phone' | 'email'>('phone')

  const data = searchParams.get('data')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const {
    control,
    handleSubmit: handleChange,
    formState: { errors: errors },
    getValues,
    setValue
  } = useForm<FormDataRegisterStepOne>({
    defaultValues: {
      email: '',
      phone: '',
      password: ''
    },
    mode: 'all',
    resolver: yupResolver(schemaRegister)
  })

  const [otp, setOtp] = useState('')

  const mask = (phone: string) => {
    // const phoneLength = phone.length
    // const phoneFirst = phone.substring(0, 3)
    // const phoneLast = phone.substring(phoneLength - 3 > 0 ? phoneLength - 3 : 0)

    return phone
  }

  //   start count down
  const countDownSeconds = 30
  const countDownSecondsFailAllMethod = 300
  const maxTryChangeMethod = 1
  const [countDown, setCountDown] = useState(countDownSeconds)
  const [countDownStatus, setCountDownStatus] = useState(false)
  const [tryCount, setTryCount] = useState(0)

  const { mutate: sendOtp } = useMutation(vendorService.sendOtp, {
    onSuccess: () => {
      toast.success(
        `Kode otp verifikasi sudah terkirim, silakan cek ${
          methodVerification == 'phone' ? 'Nomor' : 'Email'
        }.`
      )
      setOtp('')
    },
    onError: (err: errorType) => {
      if (
        err.response.data.message ===
        'Your phone number is not valid. Please enter your active phone number again'
      ) {
        setIsPhoneAvailable(false)
        setMsgErrPhone(
          t('Your phone number is not valid. Please enter your active phone number again') ??
            'Your phone number is not valid. Please enter your active phone number again'
        )

        showChangePhoneOrEmail()
      }
    }
  })

  const { mutate: validateOtp } = useMutation(vendorService.validateOtp, {
    onSuccess: data => {
      toast.success(t(data.data.message))
      router.push({
        pathname: '/register/success',
        query: {
          data: encrypt(
            JSON.stringify({
              email: email,
              phone: phone,
              password: password
            })
          )
        }
      })
    },
    onError: (error: any) => {
      toast.error(t(error.data.message))
    }
  })

  const showChangePhoneOrEmail = () => {
    setIsChangePhoneOrEmail(true)
  }

  const hideChangePhoneOrEmail = () => {
    setIsChangePhoneOrEmail(false)
  }

  const startCountDown = () => {
    let _methodVerification = methodVerification
    let _tryCount = tryCount

    if (tryCount >= maxTryChangeMethod) {
      _methodVerification = methodVerification === 'phone' ? 'email' : 'phone'
      setMethodVerification(_methodVerification)
      _tryCount = 0
    }

    if (_methodVerification === 'phone' && phone) {
      sendOtp({
        phone: phone
      })
    } else if (_methodVerification === 'email' && email) {
      sendOtp({
        email: email
      })
    }

    _tryCount++
    setTryCount(_tryCount)
    setCountDown(
      _methodVerification == 'phone' && methodVerification == 'email'
        ? countDownSecondsFailAllMethod
        : countDownSeconds
    )

    setCountDownStatus(true)

    // toast.success(
    //   'Kode verifikasi telah dikirimkan melalui ' +
    //     (_methodVerification === 'phone' ? 'WhatsApp' : 'Email'),
    //   {
    //     position: 'top-center'
    //   }
    // )
  }

  useEffect(() => {
    let interval: any = null

    if (countDownStatus) {
      interval = setInterval(() => {
        setCountDown(countDown => countDown - 1)
      }, 1000)
    } else if (!countDownStatus && countDown !== 0) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [countDownStatus, countDown])

  useEffect(() => {
    if (data) {
      const dataDecoded = decrypt(data)
      try {
        const dataParsed = JSON.parse(dataDecoded)

        setEmail(dataParsed.email)
        setPhone(dataParsed.phone)
        setPassword(dataParsed.password)

        setValue('email', dataParsed.email)
        setValue('phone', dataParsed.phone.replace('+62', '62'))
        setValue('password', dataParsed.password)
      } catch (error) {
        toast.error('Data tidak valid')
        router.push('/register')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (email && phone) {
      if (methodVerification == 'phone') {
        sendOtp({
          phone: phone
        })
      } else if (methodVerification == 'email') {
        sendOtp({
          email: email
        })
      }
      setCountDownStatus(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone])

  const handleSubmit = () => {
    if (methodVerification == 'phone' && phone) {
      validateOtp({
        phone: phone,
        code: otp
      })
    } else if (methodVerification == 'email' && email) {
      validateOtp({
        email: email,
        code: otp
      })
    }
  }

  // check email available
  const [msgErrEmail, setMsgErrEmail] = useState<string>('')
  const [isEmailAvailable, setIsEmailAvailable] = useState(true)
  const { mutate: checkEmailAvailable, isLoading: isLoadingCheckEmailAvailable } = useMutation(
    vendorService.checkEmailAvailable,
    {
      onSuccess: () => {
        setIsEmailAvailable(true)
      },
      onError: () => {
        setIsEmailAvailable(false)
        setMsgErrEmail(t('Email is already registered') ?? 'Email is already registered')
      }
    }
  )

  //  check phone available

  const [msgErrPhone, setMsgErrPhone] = useState<string>('')
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(true)
  const { mutate: checkPhoneAvailable2, isLoading: isLoadingCheckPhoneAvailabe2 } = useMutation(
    vendorService.checkPhoneAvailable,
    {
      onSuccess: () => {
        setIsPhoneAvailable(true)
      },
      onError: () => {
        setIsPhoneAvailable(false)
        setMsgErrPhone(
          t('Phone number is already registered') ?? 'Phone number is already registered'
        )
      }
    }
  )

  const { mutate: checkPhoneAvailable, isLoading: isLoadingCheckPhoneAvailable } = useMutation(
    vendorService.checkPhoneAvailable,
    {
      onSuccess: () => {
        setIsPhoneAvailable(true)

        const value = getValues().phone

        if (value.includes('62')) {
          if (value.startsWith('62')) checkPhoneAvailable2(value.replace('62', '+62'))
          else checkPhoneAvailable2(value.replace('+62', '+62'))
        } else checkPhoneAvailable2(value.replace('0', '+62'))
      },
      onError: () => {
        setIsPhoneAvailable(false)
        setMsgErrPhone(
          t('Phone number is already registered') ?? 'Phone number is already registered'
        )
      }
    }
  )

  const onSubmitChange = (data: FormDataRegisterStepOne) => {
    if (!isEmailAvailable || !isPhoneAvailable) {
      toast.error(t('Email or phone number is already registered'))

      return
    }

    // replace data.phone first 0 to +62
    if (data.phone.charAt(0) === '0') {
      data.phone = '+62' + data.phone.substr(1)
    }

    router.push({
      pathname: '/register/step-two',
      query: {
        data: encrypt(
          JSON.stringify({
            email: data.email,
            phone: data.phone,
            password: data.password
          })
        )
      }
    })

    hideChangePhoneOrEmail()
  }

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
        {!isChangePhoneOrEmail ? (
          <Card>
            <CardContent>
              <Typography variant='h1' color={'primary'} mb={4}>
                Verifikasi
              </Typography>

              <Typography variant='body1'>
                Masukkan kode verifikasi 4 angka dikirim ke{' '}
                {methodVerification == 'phone' ? 'WhatsApp' : 'Email'}{' '}
                {methodVerification == 'phone' ? mask(phone || '') : mask(email || '')}
              </Typography>

              <Typography
                variant='body2'
                sx={{ mt: 2, cursor: 'pointer' }}
                color={'primary'}
                onClick={showChangePhoneOrEmail}
              >
                Ubah {methodVerification == 'phone' ? 'WhatsApp' : 'Email'}{' '}
              </Typography>

              <Box my={4}>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={4}
                  renderSeparator={<Typography variant='body1'>-</Typography>}
                  renderInput={props => <input {...props} />}
                  containerStyle={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    columnGap: '10px'
                  }}
                  inputStyle={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    width: '100%',
                    border: '1px solid #E0E0E0',
                    borderRadius: '10px',
                    height: '50px'
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant='contained'
                sx={{
                  mt: 2
                }}
                onClick={handleSubmit}
                disabled={otp.length < 4}
              >
                Verifikasi
              </Button>
              <Typography variant='body2' sx={{ mt: 3 }}>
                Belum menerima kode?{' '}
                <Typography
                  variant='body2'
                  component='span'
                  color={'primary'}
                  sx={{
                    cursor: countDown > 0 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (countDown > 0) return

                    startCountDown()
                  }}
                >
                  Kirim ulang kode{' '}
                  {countDown > 0 && (
                    <Typography variant='body2' component='span' color={'primary'}>
                      dalam {countDown} detik
                    </Typography>
                  )}{' '}
                  {countDown <= 0 && tryCount >= maxTryChangeMethod && (
                    <Typography variant='body2' component='span' color={'primary'}>
                      ke {methodVerification === 'phone' ? 'Email' : 'WhatsApp'}
                    </Typography>
                  )}
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
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant='h1' color={'primary'} mb={4}>
                Ubah {methodVerification == 'phone' ? 'Nomor' : 'Email'}
              </Typography>

              <Typography variant='body1'>
                Masukkan {methodVerification == 'phone' ? 'Nomor' : 'Email'} yang benar.
              </Typography>

              <form onSubmit={handleChange(onSubmitChange)}>
                <Box sx={{ mb: 4, mt: 8 }}>
                  {methodVerification == 'phone' ? (
                    <Controller
                      name='phone'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='tel'
                          size='small'
                          label={t('WhatsApp Number')}
                          id='auth-login-v2-password'
                          {...errorInput(errors, 'phone', !isPhoneAvailable)}
                          {...(!isPhoneAvailable && { helperText: msgErrPhone })}
                          onChange={e => {
                            const value = formatPhone(e.target.value)

                            field.onChange(value)

                            if (value != '') {
                              if (value.length >= 10) {
                                if (value.includes('62')) {
                                  if (value.startsWith('62'))
                                    checkPhoneAvailable(value.replace('62', '0'))
                                  else checkPhoneAvailable(value.replace('+62', '0'))
                                } else checkPhoneAvailable(value)
                              }
                            } else {
                              setIsPhoneAvailable(true)
                            }
                          }}
                          InputProps={{
                            inputMode: 'tel',
                            endAdornment:
                              isLoadingCheckPhoneAvailable || isLoadingCheckPhoneAvailabe2 ? (
                                <InputAdornment position='end'>
                                  <Icon icon={'eos-icons:loading'} fontSize={18} />
                                </InputAdornment>
                              ) : isPhoneAvailable && !Boolean(errors.phone) ? (
                                getValues().phone ? (
                                  <InputAdornment position='end'>
                                    <Icon icon={'bi:check'} fontSize={18} color='green' />
                                  </InputAdornment>
                                ) : (
                                  <></>
                                )
                              ) : (
                                <InputAdornment position='end'>
                                  <IconButton onClick={() => field.onChange('')} edge='end'>
                                    <Icon icon={'bi:x'} fontSize={18} color='red' />
                                  </IconButton>
                                </InputAdornment>
                              )
                          }}
                        />
                      )}
                    />
                  ) : (
                    <Box sx={{ my: 4 }}>
                      <Controller
                        name='email'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size='small'
                            label='Email'
                            {...errorInput(errors, 'email', !isEmailAvailable)}
                            {...(!isEmailAvailable && { helperText: msgErrEmail })}
                            onChange={e => {
                              field.onChange(e.target.value)

                              if (e.target.value != '') {
                                if (
                                  e.target.value.match(
                                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
                                  )
                                ) {
                                  checkEmailAvailable(e.target.value)
                                }
                              } else {
                                setIsEmailAvailable(true)
                              }
                            }}
                            InputProps={{
                              endAdornment: isLoadingCheckEmailAvailable ? (
                                <InputAdornment position='end'>
                                  <Icon icon={'eos-icons:loading'} fontSize={18} />
                                </InputAdornment>
                              ) : isEmailAvailable && !Boolean(errors.email) ? (
                                getValues().email ? (
                                  <InputAdornment position='end'>
                                    <Icon icon={'bi:check'} fontSize={18} color='green' />
                                  </InputAdornment>
                                ) : (
                                  <></>
                                )
                              ) : (
                                <InputAdornment position='end'>
                                  <IconButton onClick={() => field.onChange('')} edge='end'>
                                    <Icon icon={'bi:x'} fontSize={18} color='red' />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'start'
                  }}
                ></Box>

                <Button
                  fullWidth
                  type='submit'
                  variant='contained'
                  sx={{
                    mt: 2
                  }}
                  disabled={
                    Boolean(errors.email) ||
                    Boolean(errors.phone) ||
                    !isEmailAvailable ||
                    !isPhoneAvailable
                  }
                >
                  Kirim ke {methodVerification == 'phone' ? 'WhatsApp' : 'Email'}
                </Button>
              </form>

              <Button
                fullWidth
                variant='text'
                sx={{
                  mt: 8
                }}
                onClick={hideChangePhoneOrEmail}
                startIcon={<Icon icon='akar-icons:arrow-left' />}
              >
                Kembali
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

StepTwoPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

StepTwoPage.guestGuard = true

export default StepTwoPage
