import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/invoice/data')

  return null
}

export default IndexPage
