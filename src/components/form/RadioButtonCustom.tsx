import {
  FormControlLabel,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  styled
} from '@mui/material'
import React, { useEffect } from 'react'

const MuiToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  },
  '& .MuiToggleButtonGroup-grouped.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white'
  }
}))

type RadioButtonOption = {
  value: string | number
  label: string
}

type RadioButtonCustomProps = {
  options: RadioButtonOption[]
  value?: RadioButtonOption | string | number
  isStyleButton?: boolean
  onChange?: (value: RadioButtonOption) => void
} & Pick<ToggleButtonGroupProps, 'sx'>

const RadioButtonCustom = ({
  options,
  value,
  isStyleButton,
  onChange,
  ...field
}: RadioButtonCustomProps) => {
  const [optionSelected, setOptionSelected] = React.useState<number | string | undefined>(
    typeof value == 'object'
      ? value.value
      : options.length > 0
      ? typeof value == 'string' || typeof value == 'number'
        ? options.find(obj => obj.value == value)?.value ?? undefined
        : options[0].value
      : undefined
  )

  const handleChange = (event: any, _value: string | null) => {
    if (_value !== null) {
      const selected = options.find(option => option.value == _value)
      setOptionSelected(_value)

      if (onChange && selected) {
        onChange(selected)
      }
    }
  }

  useEffect(() => {
    setOptionSelected(
      typeof value == 'object'
        ? value.value
        : options.length > 0
        ? typeof value == 'string' || typeof value == 'number'
          ? options.find(obj => obj.value == value)?.value ?? undefined
          : options[0].value
        : undefined
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (isStyleButton) {
    return (
      <MuiToggleButtonGroup
        {...field}
        color='primary'
        value={optionSelected}
        exclusive
        onChange={handleChange}
        aria-label='text alignment'
        size='small'
      >
        {options.map(option => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </MuiToggleButtonGroup>
    )
  } else {
    return (
      <RadioGroup {...field} row value={optionSelected} onChange={handleChange}>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    )
  }
}

export default RadioButtonCustom
