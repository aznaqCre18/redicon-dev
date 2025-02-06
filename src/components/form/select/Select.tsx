import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select as SelectMUI,
  SelectProps as SelectMUIProps
} from '@mui/material'
import React from 'react'

export type SelectOption = {
  value: string | number
  label: string
}

type SelectProps = {
  options: SelectOption[]
  size?: SelectMUIProps['size']
  isFloat?: boolean
} & Omit<SelectMUIProps, 'size'>

const Select = ({ options, size = 'small', isFloat = true, ...props }: SelectProps) => {
  return isFloat ? (
    <FormControl size={size} fullWidth={props.fullWidth}>
      <InputLabel>{props.label}</InputLabel>
      <SelectMUI size={size} {...props} label={props.label}>
        {options.map((option, index) => (
          <MenuItem value={option.value} key={index}>
            {option.label}
          </MenuItem>
        ))}
      </SelectMUI>
    </FormControl>
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      <InputLabel
        sx={{
          fontSize: theme => theme.typography.body2.fontSize,
          marginBottom: 0.8
        }}
      >
        {props.label}
      </InputLabel>
      <SelectMUI
        size={size}
        {...props}
        label={props.label}
        sx={{
          '& legend > span': {
            display: 'none'
          }
        }}
      >
        {options.map((option, index) => (
          <MenuItem value={option.value} key={index}>
            {option.label}
          </MenuItem>
        ))}
      </SelectMUI>
    </Box>
  )
}

export default Select
