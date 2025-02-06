import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/user/data')

  return null
}

export default IndexPage
