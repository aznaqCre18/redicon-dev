// ** Next Import
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next/types'

// ** Styled Component
import { useQuery } from 'react-query'
import { CircularProgress } from '@mui/material'
import React from 'react'
import FormPurchase from '../components/FormPurchase'
import { purchaseService } from 'src/services/purchase/purchase'
import { setTitlePage } from 'src/utils/metaUtils'
import { useTranslation } from 'react-i18next'

const EditPurchasePage = React.memo(({ id }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const {
    data: purchaseData,
    isSuccess,
    isLoading
  } = useQuery(['purchase-data', id], {
    queryFn: () => purchaseService.getOne(id),
    retry: 0,
    cacheTime: 0
  })

  const { t } = useTranslation()
  setTitlePage(t('Edit Purchase'))

  return isLoading ? (
    <CircularProgress />
  ) : isSuccess && purchaseData && purchaseData.data.data[0].id != 0 ? (
    <FormPurchase data={purchaseData.data.data[0]} />
  ) : (
    <div>Purchase Not Found</div>
  )
})

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          id: 'next.js'
        }
      } // See the "paths" section below
    ],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = ({ params }: GetStaticPropsContext) => {
  return {
    props: {
      id: params?.id
    }
  }
}

export default EditPurchasePage
