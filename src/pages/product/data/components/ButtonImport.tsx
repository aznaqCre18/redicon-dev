import { Icon } from '@iconify/react'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDisclosure } from 'src/hooks/useDisclosure'
import DialogImport from './dialogs/DialogImport'

const ButtonImport = () => {
  const [type, setType] = React.useState<'single' | 'multiple'>('single')
  const { isOpen: isOpenDialog, onClose: onCloseDialog, onOpen: onOpenDialog } = useDisclosure()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const { t } = useTranslation()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleOpenDialog = (type: 'single' | 'multiple') => {
    handleClose()

    setType(type)
    onOpenDialog()
  }

  return (
    <Box>
      <Button variant='outlined' onClick={handleClick} startIcon={<Icon icon='mdi:table-import' />}>
        {t('Import')}
      </Button>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={() => handleOpenDialog('single')}>Single Variant</MenuItem>
        <MenuItem onClick={() => handleOpenDialog('multiple')}>Multiple Variant</MenuItem>
      </Menu>

      <DialogImport open={isOpenDialog} closeDialog={onCloseDialog} type={type} />
    </Box>
  )
}

export default ButtonImport
