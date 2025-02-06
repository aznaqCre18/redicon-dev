import { Icon } from '@iconify/react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import React, { memo } from 'react'
import { useDisclosure } from 'src/hooks/useDisclosure'
import DialogDetail from './dialogs/DialogDetail'
import { ProductDetailType } from 'src/types/apps/productType'
import { useTranslation } from 'react-i18next'

type props = {
  product: ProductDetailType
}

const MenuOptionAction = ({ product }: props) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const { isOpen: isOpenDetail, onOpen: openDetail, onClose: closeDetail } = useDisclosure()

  const handleDetail = () => {
    openDetail()
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size='small'
        sx={{ marginLeft: '5px' }}
      >
        <Icon icon='ep:more-filled' fontSize='0.875rem' />
      </IconButton>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={handleDetail}>{t('Product Detail')}</MenuItem>
      </Menu>
      <DialogDetail open={isOpenDetail} onClose={closeDetail} productId={product.product.id} />
    </>
  )
}

export default memo(MenuOptionAction)
