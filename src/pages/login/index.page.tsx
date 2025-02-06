import { useState, ReactNode } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from 'src/hooks/useAuth'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { TextField } from '@mui/material'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

const defaultValues = {
  password: '',
  email: ''
}

interface FormData {
  email: string
  password: string
}

const LoginPage = () => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const auth = useAuth()

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: FormData) => {
    const { email, password } = data

    auth.login(
      { user: email, password, rememberMe: true },
      err => {
        if (err.code == 'ERR_NETWORK') {
          toast.error(
            'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
          )
        } else if (err.code == 'ECONNABORTED') {
          toast.error('Silakan cek koneksi jaringan anda.')
        } else {
          if ((err.response as any).status == 401) {
            setError('email', {
              type: 'manual',
              message: 'Email or Password is invalid'
            })
          } else if ((err.response as any).status == 500) {
            toast.error(
              'Saat ini sistem kami sedang mengalami lonjakan pengguna, mohon coba kembali dalam beberapa saat kemudian'
            )
          } else {
            toast.error(err.message)
          }
        }
      },
      '/order'
    )
  }

  return (
    <Box className='content-center' sx={{ backgroundColor: 'background.paper' }}>
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
          <Box sx={{ my: 6 }}>
            <Typography fontSize={20} sx={{ color: 'text.secondary' }}>
              {t('Login to Dashboard')}
            </Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 4 }}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    autoFocus
                    size='small'
                    label={t('Email')}
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.email)}
                    {...(errors.email && { helperText: errors.email.message })}
                  />
                )}
              />
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    size='small'
                    label={t('Password')}
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    id='auth-login-v2-password'
                    error={Boolean(errors.password)}
                    {...(errors.password && { helperText: errors.password.message })}
                    type={showPassword ? 'text' : 'password'}
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
            <Button fullWidth type='submit' variant='contained' sx={{ mb: 2, mt: 3 }}>
              {t('Login')}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
