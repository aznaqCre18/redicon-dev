import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import OtpInput from 'react-otp-input'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import { Icon } from '@iconify/react'
import { decrypt, encrypt } from 'src/utils/cryptoUtils'
import { useTranslation } from 'react-i18next'
import { forgorPasswordService } from 'src/services/forgotPassword'

const VerifyEmailPhone = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [methodVerification, setMethodVerification] = useState<'phone' | 'email' | undefined>()

  const data = searchParams.get('data')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [otp, setOtp] = useState('')

  const mask = (phone: string) => {
    const phoneLength = phone.length
    const phoneFirst = phone.substring(0, 3)
    const phoneLast = phone.substring(phoneLength - 3 > 0 ? phoneLength - 3 : 0)

    return `${phoneFirst}********${phoneLast}`
  }

  //   start count down
  const countDownSeconds = 30
  const countDownSecondsFailAllMethod = 300
  const maxTryChangeMethod = 2
  const [countDown, setCountDown] = useState(countDownSeconds)
  const [countDownStatus, setCountDownStatus] = useState(false)
  const [tryCount, setTryCount] = useState(0)

  const { mutate: sendOtp } = useMutation(forgorPasswordService.sendOtp, {
    onSuccess: () => {
      toast.success(
        `Kode otp verifikasi sudah terkirim, silakan cek ${
          methodVerification == 'phone' ? 'Nomor' : 'Email'
        }.`
      )
      setCountDownStatus(true)
      setOtp('')
    },
    onError: () => {
      setCountDownStatus(true)
    }
  })

  const { mutate: validateOtp } = useMutation(forgorPasswordService.validateOtp, {
    onSuccess: data => {
      toast.success(t(data.data.message))
      router.push({
        pathname: '/forgot-password/reset',
        query: {
          data: encrypt(
            JSON.stringify({
              email: email,
              phone: phone,
              code: data.data.data.code
            })
          )
        }
      })
    },
    onError: (error: any) => {
      toast.error(error.data.message)
    }
  })

  const startCountDown = () => {
    let _methodVerification = methodVerification
    let _tryCount = tryCount

    if (tryCount >= maxTryChangeMethod) {
      _methodVerification = methodVerification === 'phone' ? 'email' : 'phone'
      setMethodVerification(_methodVerification)
      _tryCount = 0
    }

    if (sendOtp) {
      if (_methodVerification === 'phone' && phone) {
        sendOtp({
          phone: phone
        })
      } else if (_methodVerification === 'email' && email) {
        sendOtp({
          email: email
        })
      }
    }

    _tryCount++
    setTryCount(_tryCount)
    setCountDown(
      _methodVerification == 'phone' && methodVerification == 'email'
        ? countDownSecondsFailAllMethod
        : countDownSeconds
    )

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

        console.log(dataParsed)

        if (dataParsed.email) {
          setMethodVerification('email')
          setEmail(dataParsed.email)
        } else if (dataParsed.phone) {
          setMethodVerification('phone')
          setPhone(dataParsed.phone)
        } else {
          toast.error('Data tidak valid')
          router.push('/forgot-password')
        }
      } catch (error) {
        toast.error('Data tidak valid')
        router.push('/forgot-password')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (methodVerification == 'phone' && phone) {
      sendOtp({
        phone: phone
      })
    }

    if (methodVerification == 'email' && email) {
      sendOtp({
        email: email
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone, methodVerification])

  const handleSubmit = () => {
    if (methodVerification == 'phone' && phone) {
      validateOtp({
        phone: phone,
        otp: otp
      })
    } else if (methodVerification == 'email' && email) {
      validateOtp({
        email: email,
        otp: otp
      })
    }
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
        <Card>
          <CardContent>
            <Typography variant='body1'>
              Masukkan kode verifikasi 6 angka dikirim ke{' '}
              {methodVerification == 'phone' ? 'WhatsApp' : 'Email'}{' '}
              {methodVerification == 'phone' ? mask(phone || '') : mask(email || '')}
            </Typography>

            {/* ubah nomer */}
            <Typography variant='body2' sx={{ mt: 2 }} color={'primary'}>
              Ubah {methodVerification == 'phone' ? 'Nomor' : 'Email'}{' '}
            </Typography>

            <Box my={4}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
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
              disabled={otp.length < 6}
            >
              Verifikasi
            </Button>
            <Typography variant='body2' sx={{ mt: 3 }}>
              Belum menerima kode verifikasi?{' '}
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
                Kirim ulang{' '}
                {countDown > 0 && (
                  <Typography variant='body2' component='span' color={'primary'}>
                    dalam {countDown} detik
                  </Typography>
                )}{' '}
                {tryCount >= maxTryChangeMethod && (
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
                    router.push('/forgot-password')
                  }}
                  startIcon={<Icon icon='mingcute:left-fill' />}
                >
                  Kembali
                </Button>
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

VerifyEmailPhone.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

VerifyEmailPhone.guestGuard = true

export default VerifyEmailPhone
