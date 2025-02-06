import { Icon } from '@iconify/react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import React from 'react'
import { OrderFullDetailType } from 'src/types/apps/order'

type props = {
  data: OrderFullDetailType
}

const MenuOptionAction = ({}: props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
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
        <MenuItem>Detail</MenuItem>
        <MenuItem>Riwayat</MenuItem>
        <MenuItem>Print</MenuItem>
      </Menu>
    </>
  )
}

export default MenuOptionAction
