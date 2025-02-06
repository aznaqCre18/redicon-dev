import { useRouter } from 'next/router'

const IndexPage = () => {
  const router = useRouter()
  router.push('/reports/total-transactions/transaction')

  return null
}

export default IndexPage
