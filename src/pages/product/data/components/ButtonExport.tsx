import { Icon } from '@iconify/react'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import React from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { productService } from 'src/services/product'

const ButtonExport = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const { t } = useTranslation()

  const { mutate: exportExcelSingleVariant } = useMutation(
    productService.exportExcelSingleVariant,
    {
      onSuccess: data => {
        const url = window.URL.createObjectURL(new Blob([data.data as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'products-single-variant.xlsx')
        link.click()

        toast.success(t('Success download file'))
      }
    }
  )

  const { mutate: exportExcelMultipleVariant } = useMutation(
    productService.exportExcelMultipleVariant,
    {
      onSuccess: data => {
        const url = window.URL.createObjectURL(new Blob([data.data as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'products-multiple-variant.xlsx')
        link.click()

        toast.success(t('Success download file'))
      }
    }
  )

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box>
      <Button
        variant='outlined'
        onClick={handleClick}
        startIcon={<Icon icon='file-icons:microsoft-excel' />}
      >
        {t('Export')}
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
        <MenuItem
          onClick={() => {
            exportExcelSingleVariant()
            handleClose()
          }}
        >
          Single Variant
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportExcelMultipleVariant()
            handleClose()
          }}
        >
          Multiple Variant
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ButtonExport
