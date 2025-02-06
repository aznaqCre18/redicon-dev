import { Grid } from '@mui/material'
import React from 'react'
import { formatDate } from 'src/utils/dateUtils'
import Dialog from 'src/views/components/dialogs/Dialog'
import { useTranslation } from 'react-i18next'
import { OrderCartDetailType } from 'src/types/apps/posOrder'
import TableListItemPosCartItem from './TableListItemPosCartItem'

interface DialogProps {
  title: string
  open: boolean
  toggle: () => void
  data?: OrderCartDetailType
}
const DialogDetailPosCartDetail = (props: DialogProps) => {
  const { t } = useTranslation()
  const { title, open, toggle } = props

  const handleClose = () => {
    toggle()
  }

  const data = props.data

  return (
    <Dialog maxWidth='lg' title={title} open={open} onClose={handleClose} enableCloseBackdrop>
      {!data ? (
        <div>Loading...</div>
      ) : (
        <Grid container gap={4}>
          <Grid container item xs={12}>
            <Grid item xs={6}>
              <table>
                <tr>
                  <td>{t('ID')}</td>
                  {
                    <td>
                      :{' '}
                      {'P' +
                        '0'.repeat(5 - data?.order_cart.id.toString().length) +
                        data?.order_cart.id}
                    </td>
                  }
                </tr>
                <tr>
                  <td>{t('Date')}</td>
                  <td>
                    : {data?.order_cart.created_at && formatDate(data?.order_cart.created_at)}
                  </td>
                </tr>
                <tr>
                  <td>{t('Note')}</td>
                  <td>: {data?.order_cart.note}</td>
                </tr>
              </table>
            </Grid>
            <Grid item xs={6}>
              <table>
                <tr>
                  <td>{t('Order Type')}</td>
                  <td
                    style={{
                      textTransform: 'capitalize'
                    }}
                  >
                    : {data?.order_cart.order_type.toLowerCase()}
                  </td>
                </tr>
                <tr>
                  <td>{t('Customer')}</td>
                  <td>: {data?.customer.name}</td>
                </tr>
                <tr>
                  <td>{t('Cashier')}</td>
                  <td>: {data?.order_cart.created_by_name}</td>
                </tr>
              </table>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableListItemPosCartItem data={data} />
          </Grid>
        </Grid>
      )}
    </Dialog>
  )
}

export default DialogDetailPosCartDetail
