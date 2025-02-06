import { TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import CustomTextFieldMUI from 'src/@core/components/mui/text-field'

const CustomTextField = forwardRef((props: TextFieldProps, ref) => {
  const { ..._props } = props

  return (
    <CustomTextFieldMUI
      ref={ref}
      {..._props}
      sx={{
        '& .MuiFormHelperText-root': {
          fontSize: '0.6875rem',
          ml: '14px'
        },
        ..._props.sx
      }}
    />
  )
})

export default CustomTextField
