import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/purchase/data')

  return null
}

export default IndexPage
