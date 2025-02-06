import React, { memo } from 'react'
// import { useQuery } from 'react-query'
// import { userService } from 'src/services/user'
// import { ProductDetailType } from 'src/types/apps/productType'
// import { formatDate } from 'src/utils/dateUtils'
import Dialog from 'src/views/components/dialogs/Dialog'

type props = {
  productId: number
  open: boolean
  onClose: () => void
}

const DialogDetail = memo(({ productId, open, onClose }: props) => {
  // const { data: dataUser } = useQuery(['user-edit-product'], {
  //   queryFn: () => userService.getUser(ProductId.product.updated_by.toString())
  // })

  return (
    <Dialog {...{ open, onClose }} title='Detail Produk'>
      <div>Product ID: {productId}</div>
      {/* <div>Last Edit: {formatDate(ProductId.product.updated_at)}</div>
      <div>Edit By: {dataUser?.data.data.name}</div> */}
    </Dialog>
  )
})

export default DialogDetail
