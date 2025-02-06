// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { styled } from '@mui/material/styles'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'

import { TextField } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useState } from 'react'
import { variantValueType } from 'src/types/apps/productType'

interface DialogType {
  open: boolean
  onClose: () => void
  onSave: (variants: variantValueType[]) => void
  oldVariants: variantValueType[]
}

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const DialogSizes = ({ open, onClose, onSave, oldVariants }: DialogType) => {
  const handleClose = () => onClose()
  const [variants, setVarians] = useState<variantValueType[]>([
    ...oldVariants,
    { name: '', isActive: false }
  ])

  const onChangeVarian = (index: number, value: string) => {
    if (variants[index].name == '') {
      variants.push({ name: '', isActive: false })
    }
    variants[index].name = value
    setVarians([...variants])
  }

  const handleSave = () => {
    onSave(variants.filter(varian => varian.name != ''))
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle id='form-dialog-title'>
        Varian Sizes
        <CustomCloseButton aria-label='close' onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
      </DialogTitle>
      <DialogContent>
        {variants.map((varian, index) => (
          <TextField
            key={index}
            label='Size'
            variant='outlined'
            size='small'
            type='number'
            defaultValue={varian.name}
            onChange={e => onChangeVarian(index, e.target.value)}
            fullWidth
            sx={{ width: 552, marginBottom: '20px' }}
          />
        ))}
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSave} variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogSizes
