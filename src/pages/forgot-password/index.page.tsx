import * as yup from 'yup'

// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { encrypt } from 'src/utils/cryptoUtils'
import { useRouter } from 'next/router'
import { devMode } from 'src/configs/dev'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { forgorPasswordService } from 'src/services/forgotPassword'

// Styled Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 650,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  fontSize: theme.typography.body1.fontSize
}))

type ForgotPasswordData = {
  email_or_phone: string
}

const schema = yup.object().shape({
  email_or_phone: yup.string().required('Please enter a valid email or phone')
})

const mailFormat = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})|([0-9]{10})+$/

const phoneFormat = /^[0-9]{10}$/

const ForgotPassword = () => {
  const router = useRouter()
  // ** Hooks
  const { t } = useTranslation()
  const theme = useTheme()

  const [validForm, setValidForm] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')

  // ** Vars
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Form
  const { handleSubmit, control, formState, setError } = useForm<ForgotPasswordData>({
    mode: 'all',
    resolver: yupResolver(schema)
  })

  // ** Function to handle form submit
  const onSubmit = () => {
    if (emailOrPhone.match(mailFormat)) {
      sendOtp({ email: emailOrPhone })
    } else if (emailOrPhone.match(phoneFormat)) {
      sendOtp({ phone: emailOrPhone })
    }
  }

  // ** Effect
  useEffect(() => {
    if (emailOrPhone == '') return setValidForm(true)

    if (emailOrPhone.match(mailFormat) || emailOrPhone.match(phoneFormat)) {
      setValidForm(true)
    } else {
      setValidForm(false)
    }
  }, [emailOrPhone])

  const { mutate: sendOtp } = useMutation(forgorPasswordService.sendOtp, {
    onSuccess: () => {
      if (emailOrPhone.match(mailFormat)) {
        router.push({
          pathname: '/forgot-password/verify-email-phone',
          query: {
            data: encrypt(
              JSON.stringify({
                email: emailOrPhone,
                phone: null
              })
            )
          }
        })
      } else if (emailOrPhone.match(phoneFormat)) {
        router.push({
          pathname: '/forgot-password/verify-email-phone',
          query: {
            data: encrypt(
              JSON.stringify({
                email: null,
                phone: emailOrPhone
              })
            )
          }
        })
      }
    },
    onError: () => {
      setError('email_or_phone', {
        message: t('Email or phone not found') ?? 'Email or phone not found'
      })
    }
  })

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
          <ForgotPasswordIllustration
            alt='forgot-password-illustration'
            src={`/images/pages/auth-v2-forgot-password-illustration-${theme.palette.mode}.png`}
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
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <img src={devMode ? '/images/favicon.png' : '/images/logo.png'} alt='logo' width={34} />

            <Box sx={{ my: 6 }}>
              <Typography
                sx={{ mb: 1.5, fontWeight: 500, fontSize: '1.625rem', lineHeight: 1.385 }}
              >
                {t('Forgot Password?')} 🔒
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {t(
                  `Enter your email or phone number and we'll send you instructions to reset your password`
                )}
              </Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Controller
                control={control}
                name='email_or_phone'
                render={({ field: { onChange, ...field } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='email'
                    label={t('Email / Phone')}
                    error={!validForm || formState.errors.email_or_phone ? true : false}
                    helperText={
                      !validForm
                        ? t('Please enter a valid email or phone')
                        : formState.errors.email_or_phone?.message
                    }
                    value={emailOrPhone}
                    onChange={e => {
                      setEmailOrPhone(e.target.value)
                      onChange(e)
                    }}
                    sx={{ display: 'flex', mb: 4 }}
                  />
                )}
              />
              <Button fullWidth type='submit' variant='contained' sx={{ mb: 4 }}>
                {t('Send otp code')}
              </Button>
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': { mr: 1 }
                }}
              >
                <LinkStyled href='/login'>
                  <Icon fontSize='1.25rem' icon='tabler:chevron-left' />
                  <span>{t('Back to login')}</span>
                </LinkStyled>
              </Typography>
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

ForgotPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

ForgotPassword.guestGuard = true

export default ForgotPassword
