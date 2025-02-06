// ** Next Import
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next/types'

// ** Styled Component
import { productService } from 'src/services/product'
import { useQuery } from 'react-query'
import { CircularProgress } from '@mui/material'
import React from 'react'
import FormProduct from '../data/add/FormProduct'
import { ProductDetailWithoutMembershipType } from 'src/types/apps/productType'

const EditProductPage = React.memo(({ id }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const {
    data: productData,
    isSuccess,
    isLoading
  } = useQuery(['product-data', id], {
    queryFn: () => productService.getProductDetail(id),
    retry: 0,
    cacheTime: 0
  })

  return isLoading ? (
    <CircularProgress />
  ) : isSuccess && productData && productData.data.data.product.id != 0 ? (
    <FormProduct data={productData.data.data as unknown as ProductDetailWithoutMembershipType} />
  ) : (
    <div>Error</div>
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

export default EditProductPage
