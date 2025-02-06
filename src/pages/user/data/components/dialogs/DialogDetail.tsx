import React, { memo } from 'react'
import { UserDetailType } from 'src/types/apps/userTypes'
import Dialog from 'src/views/components/dialogs/Dialog'

type props = {
  data: UserDetailType
  open: boolean
  onClose: () => void
}

const DialogDetail = memo(({ open, onClose }: props) => {
  // const { data: dataUser } = useQuery(['user-edit-product', data.product.updated_by], {
  //   queryFn: () => userService.getUser(data.product.updated_by.toString())
  // })

  return (
    <Dialog {...{ open, onClose }} title='Detail Produk'>
      {/* <div>Last Edit: {formatDate(data.product.updated_at)}</div> */}
      {/* <div>Edit By: {dataUser?.data.data.name}</div> */}
    </Dialog>
  )
})

export default DialogDetail
