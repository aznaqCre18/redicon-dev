import { Icon } from '@iconify/react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import React from 'react'
import { useDisclosure } from 'src/hooks/useDisclosure'
import DialogDetail from './dialogs/DialogDetail'
import { CustomerType } from 'src/types/apps/customerType'

type props = {
  data: CustomerType
}

const MenuOptionAction = ({ data }: props) => {
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
    <div>
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
        <MenuItem onClick={handleDetail}>Detail Pesanan</MenuItem>
      </Menu>
      <DialogDetail open={isOpenDetail} onClose={closeDetail} data={data} />
    </div>
  )
}

export default MenuOptionAction
