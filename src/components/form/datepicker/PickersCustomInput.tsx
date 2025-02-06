// ** React Imports
import { TextField, TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'

// ** Custom Component Import
export type PickerProps = {
  label?: string
  readOnly?: boolean
} & TextFieldProps

const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
  // ** Props
  const { label, readOnly } = props

  return (
    <TextField
      {...props}
      size='small'
      inputRef={ref}
      sx={{
        '& .MuiFormControl-root': {
          width: props.fullWidth ? '100% !important' : 'unset'
        }
      }}
      label={label || ''}
      {...(readOnly && { inputProps: { readOnly: true } })}
    />
  )
})

export default PickersComponent
