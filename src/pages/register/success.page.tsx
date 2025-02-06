import { Box, Button, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const SuccessRegistration = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const data = searchParams.get('data')

  const handleContinue = () => {
    router.push({
      pathname: '/register/set-business',
      query: { data }
    })
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
      <img
        style={{ marginRight: 20 }}
        src={'/images/registration/success.png'}
        alt='Success Registration'
      />
      <Box
        p={4}
        width={400}
        sx={{
          textAlign: 'center'
        }}
      >
        <Typography variant='h3'>Pendaftaran Berhasil!</Typography>
        <Typography variant='body2'>Selamat! Akun anda telah berhasil terdaftar.</Typography>

        <Button
          variant='contained'
          color='primary'
          sx={{
            marginTop: 8
          }}
          fullWidth
          onClick={handleContinue}
        >
          Lanjutkan
        </Button>
      </Box>
    </Box>
  )
}

SuccessRegistration.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
SuccessRegistration.guestGuard = true

export default SuccessRegistration
