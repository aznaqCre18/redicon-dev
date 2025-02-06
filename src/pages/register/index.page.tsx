// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Component Import

// ** Icon Imports

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import CircularProgress from '@mui/material/CircularProgress'
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material'
import themeConfig from 'src/configs/themeConfig'
import { Icon } from '@iconify/react'
import { useMutation } from 'react-query'
import { vendorService } from 'src/services/vendor'
import toast from 'react-hot-toast'
import { encrypt } from 'src/utils/cryptoUtils'
import { devMode } from 'src/configs/dev'
import { useTranslation } from 'react-i18next'
import { useApp } from 'src/hooks/useApp'
import { formatPhone } from 'src/utils/numberUtils'

// ** Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 600,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

export interface FormDataRegisterStepOne {
  email: string
  phone: string
  password: string
}

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 650
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

export const schemaRegister = yup.object().shape({
  email: yup
    .string()
    .email()
    .required()
    .label('Email')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Email must be a valid email'),
  phone: yup.string().min(10).required().label('WhatsApp Number'),
  // Harus mengandung setidaknya 1 huruf, 1 nomor dan simbol (!@#$%)
  password: yup
    .string()
    .min(6)
    .required()
    .label('Password')
    // Password must contain at least 1 letter, 1 number and symbol (!@#$%)
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()+`~/?.<,>;:'"\[\]\{\}\\\-\_\=\|])[A-Za-z\d!@#$%^&*()+`~/?.<,>;:'"\[\]\{\}\\\-\_\=\|]{6,}$/,
      'Password must contain at least 1 letter, 1 number and symbol (!@#$%)'
    )
})

const Register = () => {
  const { errorInput } = useApp()
  const { t } = useTranslation()
  // ** States
  const router = useRouter()

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const [loading, setLoading] = useState(false)

  // ** Vars
  const { skin } = settings

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

  const [showPassword, setShowPassword] = useState(false)

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

  const {
    control,
    handleSubmit: handleSubmitEmail,
    formState: { errors },
    getValues
  } = useForm<FormDataRegisterStepOne>({
    defaultValues: {
      email: '',
      phone: ''
    },
    mode: 'all',
    resolver: yupResolver(schemaRegister)
  })

  const onSubmitEmail = (data: FormDataRegisterStepOne) => {
    if (!isEmailAvailable || !isPhoneAvailable) {
      toast.error(t('Email or phone number is already registered'))

      return
    }
    setLoading(true)

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
  }

  useEffect(() => {
    console.log(errors)
  }, [errors])

  const imageSource =
    skin === 'bordered' ? 'auth-v2-register-illustration-bordered' : 'auth-v2-register-illustration'

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <RegisterIllustration
            alt='register-illustration'
            src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box width={350} textAlign={'center'}>
            <Grid container columnGap={3} alignItems={'center'} justifyContent={'center'}>
              {/* <svg width={80} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  fill={theme.palette.primary.main}
                  d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z'
                />
                <path
                  fill='#161616'
                  opacity={0.06}
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z'
                />
                <path
                  fill='#161616'
                  opacity={0.06}
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z'
                />
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  fill={theme.palette.primary.main}
                  d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z'
                />
              </svg> */}
              <img
                src={devMode ? '/images/favicon.png' : '/images/logo.png'}
                alt='logo'
                width={80}
              />

              <Typography variant='h3'>{`${themeConfig.templateName}`}</Typography>
            </Grid>
            <Box sx={{ my: 6 }}>
              <Typography fontSize={20} sx={{ color: 'text.secondary' }}>
                {t('register_msg')}
              </Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmitEmail(onSubmitEmail)}>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                          // check email format
                          if (
                            e.target.value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
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

                <Controller
                  name='phone'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, ...field } }) => (
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

                        onChange(value)

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
                              <IconButton onClick={() => onChange('')} edge='end'>
                                <Icon icon={'bi:x'} fontSize={18} color='red' />
                              </IconButton>
                            </InputAdornment>
                          )
                      }}
                    />
                  )}
                />

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
                      {...errorInput(errors, 'password')}
                      size='small'
                      error={Boolean(errors.password)}
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
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'start'
                }}
              ></Box>
              <Button fullWidth type='submit' disabled={loading} variant='contained' sx={{ mb: 4 }}>
                {loading ? (
                  <CircularProgress
                    sx={{
                      color: 'common.white',
                      width: '20px !important',
                      height: '20px !important',
                      mr: theme => theme.spacing(2)
                    }}
                  />
                ) : null}
                {t('register_btn')}
              </Button>
            </form>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <Typography sx={{ color: 'text.secondary', mr: 2 }}>
                {t('register_has_account_msg')}
              </Typography>
              <Typography component={LinkStyled} href='/login'>
                {t('register_has_account_btn')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

Register.guestGuard = true

export default Register
