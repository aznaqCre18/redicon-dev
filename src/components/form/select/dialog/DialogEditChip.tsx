import React, { useEffect, useState } from 'react'
import Dialog from '../../../../views/components/dialogs/Dialog'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box, Button } from '@mui/material'

type props = {
  index: number
  data: any
  onSubmit: (data: any) => void
  open: boolean
  onClose: () => void
}

const DialogEditChip = ({ index, data, onSubmit, open, onClose }: props) => {
  const [value, setValue] = useState<string | undefined>('')

  useEffect(() => {
    setValue(data?.[index] ?? '')
  }, [data, index])

  return (
    <Dialog {...{ open, onClose }} title={'Edit ' + data?.[index] ?? ''} maxWidth='xs'>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(value)
        }}
      >
        <CustomTextField
          autoFocus
          fullWidth
          value={value}
          onChange={e => setValue(e.target.value)}
          required
        />
        <Box mt={3} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='tonal' color='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' sx={{ ml: 3 }}>
            Submit
          </Button>
        </Box>
      </form>
    </Dialog>
  )
}

export default DialogEditChip
