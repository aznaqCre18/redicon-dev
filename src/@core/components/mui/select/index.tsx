// ** React Import
import { forwardRef } from 'react'

// ** MUI Imports
import Select, { SelectProps } from '@mui/material/Select'
import { FormControl, InputLabel } from '@mui/material'

const CustomSelect = forwardRef((props: SelectProps, ref) => {
  // ** Props
  const { ...rest } = props

  return (
    <FormControl fullWidth>
      <InputLabel id={rest.id}>{rest.defaultValue as string}</InputLabel>
      <Select inputRef={ref} labelId={rest.id} id={rest.id} {...rest}>
        {rest.children}
      </Select>
    </FormControl>
  )
})

export default CustomSelect
