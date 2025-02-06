import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/reports/order')

  return null
}

export default IndexPage
