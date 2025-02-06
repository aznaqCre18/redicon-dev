// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(20)
  }
}))

const Error404 = () => {
  const router = useRouter()

  return (
    <Box className='content-center'>
      <Box
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <BoxWrapper>
          <Typography variant='h2' sx={{ mb: 1.5 }}>
            Page Not Found :(
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            Oops! 😖 The requested URL was not found on this server.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Button
              variant='contained'
              onClick={router.back}
              startIcon={
                <Icon
                  icon='ic:round-arrow-back-ios'
                  style={{
                    fontSize: '1.25rem'
                  }}
                />
              }
            >
              Back
            </Button>
            <Button href='/' component={Link} variant='contained'>
              Go to Home
            </Button>
          </div>
        </BoxWrapper>
        <Img height='500' alt='error-illustration' src='/images/pages/404.png' />
      </Box>
      <FooterIllustrations />
    </Box>
  )
}

Error404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error404
