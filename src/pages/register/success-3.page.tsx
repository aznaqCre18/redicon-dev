import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect } from 'react'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'
import { decrypt } from 'src/utils/cryptoUtils'

const SuccessRegistration = () => {
  const auth = useAuth()

  const searchParams = useSearchParams()

  const data = searchParams.get('data')

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
      '/register/success-2'
    )
  }

  useEffect(() => {
    console.log('auth', auth.user)
    console.log('data', data)

    if (data && auth.user == null) {
      console.log(data)

      const dataDecoded = decrypt(data)
      try {
        const dataParsed = JSON.parse(dataDecoded)
        console.log(dataParsed)

        login(dataParsed.email, dataParsed.password)
      } catch (error) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return null
}

SuccessRegistration.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

SuccessRegistration.guestGuard = true

export default SuccessRegistration
