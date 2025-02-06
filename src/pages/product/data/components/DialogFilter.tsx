// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'

import { Select, TextField, MenuItem, FormControl, InputLabel, Box } from '@mui/material'
import { memo } from 'react'
import Dialog from 'src/views/components/dialogs/Dialog'

interface DialogFilterInterface {
  open: boolean
  onClose: () => void
}
const DialogFilter = memo(({ open, onClose }: DialogFilterInterface) => {
  const handleClose = () => onClose()

  // const [imgSrc, setImgSrc] = useState('')
  // const [inputValue, setInputValue] = useState('')

  return (
    <Dialog open={open} onClose={handleClose} title='Add Customer'>
      <TextField
        label='Name'
        variant='outlined'
        size='small'
        fullWidth
        sx={{ width: 552, marginBottom: '20px' }}
      />
      <TextField
        label='Email'
        variant='outlined'
        size='small'
        fullWidth
        sx={{ width: 552, marginBottom: '20px' }}
      />
      <TextField
        label='Phone Number'
        variant='outlined'
        size='small'
        fullWidth
        sx={{ width: 552, marginBottom: '20px' }}
      />
      <FormControl fullWidth size='small'>
        <InputLabel id='demo-simple-select-label'>Membership Type</InputLabel>
        <Select labelId='demo-simple-select-labels' id='demo-simple-select' label='Membership Type'>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Button type='submit' variant='contained' sx={{ mr: 3 }}>
          Submit
        </Button>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          Cancel
        </Button>
      </Box>
    </Dialog>
  )
})

export default DialogFilter
