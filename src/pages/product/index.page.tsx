import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/product/data')

  return null
}

export default IndexPage
