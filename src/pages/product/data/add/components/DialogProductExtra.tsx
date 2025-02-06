import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { productExtraService } from 'src/services/product/extra'
import { ProductExtraType } from 'src/types/apps/productExtra'
import { maxLimitPagination } from 'src/types/pagination/pagination'
import Dialog from 'src/views/components/dialogs/Dialog'

type Props = {
  open: boolean
  productExtraSelected: ProductExtraType | null
  onSelect: (value: ProductExtraType) => void
  onClose: () => void
}

const DialogProductExtra = ({ open, productExtraSelected, onSelect, onClose }: Props) => {
  const { t } = useTranslation()

  const [datas, setDatas] = useState<ProductExtraType[]>([])

  useQuery(['product-extra-list-all'], {
    queryFn: () => productExtraService.getList(maxLimitPagination),
    onSuccess: data => {
      setDatas(data?.data.data ?? [])
    }
  })

  return (
    <Dialog open={open} onClose={onClose} title={t('Product Extra')} maxWidth='md'>
      <Table
        sx={{
          border: theme => `1px solid ${theme.palette.divider}`,
          '& td, & th': {
            px: '0.8rem !important',
            py: '0.5rem !important'
          }
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: theme => theme.palette.customColors.tableHeaderBg
            }}
          >
            <TableCell>{t('Name')}</TableCell>
            <TableCell>{t('Type')}</TableCell>
            <TableCell>{t('Choice Type')}</TableCell>
            <TableCell>{t('Minimum Choice')}</TableCell>
            <TableCell>{t('Maximum Choice')}</TableCell>
            <TableCell>{t('Item')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datas.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                cursor: 'pointer',
                backgroundColor: theme =>
                  productExtraSelected?.id === item.id ? theme.palette.primary.main : undefined,
                '&:hover': {
                  backgroundColor: productExtraSelected?.id === item.id ? undefined : 'action.hover'
                }
              }}
              onClick={() => {
                onSelect(item)
                onClose()
              }}
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.choice_type}</TableCell>
              <TableCell>{item.minimum_choice}</TableCell>
              <TableCell>{item.maximum_choice}</TableCell>
              <TableCell>
                {(item.items ?? [])
                  .filter(item => item.is_active)
                  .map(item => item.name)
                  .join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Dialog>
  )
}

export default DialogProductExtra
