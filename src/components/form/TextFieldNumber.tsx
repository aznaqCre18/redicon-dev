import { TextField, TextFieldProps, styled } from '@mui/material'
import React, { forwardRef } from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

const TextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => ({
  alignItems: 'flex-start',
  '& .MuiInputLabel-root': {
    transform: 'none',
    lineHeight: 1.154,
    position: 'relative',
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize
  },
  // '& .MuiOutlinedInput-notchedOutline': {
  //   top: '0 !important'
  // },
  '& .MuiInputBase-root': {
    borderRadius: 8,
    backgroundColor: 'transparent !important',
    transition: theme.transitions.create(['border-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter
    }),
    '&:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error):hover': {
      borderColor: `rgba(${theme.palette.customColors.main}, 0.28)`
    },
    '&:before, &:after': {
      display: 'none'
    },
    '&.MuiInputBase-sizeSmall': {
      borderRadius: 6
    },
    '&.Mui-error': {
      borderColor: theme.palette.error.main
    },
    '&.Mui-focused': {
      boxShadow: theme.shadows[2],
      '& .MuiInputBase-input:not(.MuiInputBase-readOnly):not([readonly])::placeholder': {
        transform: 'translateX(4px)'
      },
      '&.MuiInputBase-colorPrimary': {
        borderColor: theme.palette.primary.main
      },
      '&.MuiInputBase-colorSecondary': {
        borderColor: theme.palette.secondary.main
      },
      '&.MuiInputBase-colorInfo': {
        borderColor: theme.palette.info.main
      },
      '&.MuiInputBase-colorSuccess': {
        borderColor: theme.palette.success.main
      },
      '&.MuiInputBase-colorWarning': {
        borderColor: theme.palette.warning.main
      },
      '&.MuiInputBase-colorError': {
        borderColor: theme.palette.error.main
      },
      '&.Mui-error': {
        borderColor: theme.palette.error.main
      }
    },
    '&.Mui-disabled': {
      backgroundColor: `${theme.palette.action.selected} !important`
    },
    '& .MuiInputAdornment-root': {
      marginTop: '0 !important'
    }
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.secondary,
    '&:not(textarea)': {
      padding: '15.5px 13px'
    },
    '&:not(textarea).MuiInputBase-inputSizeSmall': {
      padding: '7.5px 13px'
    },
    '&:not(.MuiInputBase-readOnly):not([readonly])::placeholder': {
      transition: theme.transitions.create(['opacity', 'transform'], {
        duration: theme.transitions.duration.shorter
      })
    },

    // ** For Autocomplete
    '&.MuiInputBase-inputAdornedStart:not(.MuiAutocomplete-input)': {
      paddingLeft: 0
    },
    '&.MuiInputBase-inputAdornedEnd:not(.MuiAutocomplete-input)': {
      paddingRight: 0
    }
  },
  '& .MuiFormHelperText-root': {
    lineHeight: 1.154,
    margin: theme.spacing(1, 0, 0),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    '&.Mui-error': {
      color: theme.palette.error.main
    }
  },

  // ** For Select
  '& .MuiSelect-select:focus, & .MuiNativeSelect-select:focus': {
    backgroundColor: 'transparent'
  },
  '& .MuiSelect-filled .MuiChip-root': {
    height: 22
  },

  // ** For Autocomplete
  '& .MuiAutocomplete-input': {
    paddingLeft: '6px !important',
    paddingTop: '7.5px !important',
    paddingBottom: '7.5px !important',
    '&.MuiInputBase-inputSizeSmall': {
      paddingLeft: '6px !important',
      paddingTop: '2.5px !important',
      paddingBottom: '2.5px !important'
    }
  },
  '& .MuiAutocomplete-inputRoot': {
    paddingTop: '8px !important',
    paddingLeft: '8px !important',
    paddingBottom: '8px !important',
    '&:not(.MuiInputBase-sizeSmall).MuiInputBase-adornedStart': {
      paddingLeft: '13px !important'
    },
    '&.MuiInputBase-sizeSmall': {
      paddingTop: '5px !important',
      paddingLeft: '5px !important',
      paddingBottom: '5px !important',
      '& .MuiAutocomplete-tag': {
        margin: 2,
        height: 22
      }
    }
  },

  // ** For Textarea
  '& .MuiInputBase-multiline': {
    padding: '15.25px 13px',
    '&.MuiInputBase-sizeSmall': {
      padding: '7.25px 13px'
    },
    '& textarea.MuiInputBase-inputSizeSmall:placeholder-shown': {
      overflowX: 'hidden'
    }
  },

  // ** For Date Picker
  '& + .react-datepicker__close-icon': {
    top: 11,
    '&:after': {
      fontSize: '1.6rem !important'
    }
  },

  '& legend > span': {
    display: 'none'
  }
}))

type Props = {
  disablededit?: 'true' | 'false'
  value?: number | undefined | null
  defaultValue?: number | undefined | null
  onChange?: (value: number | undefined | null) => void
  isFloat?: boolean
  max?: number | undefined
  min?: number | undefined
  prefix?: string
  suffix?: string
}

const TextFieldNumber = forwardRef(function TextFieldNumber(
  {
    isFloat,
    disablededit,
    min,
    prefix,
    suffix,
    ...props
  }: Props & Omit<NumericFormatProps, 'size' | 'onChange'> & Omit<TextFieldProps, 'onChange'>,
  ref
) {
  const { size = 'small', hidden, onChange, ...rest } = props

  return isFloat ? (
    <NumericFormat
      getInputRef={ref}
      size={size}
      sx={{
        mt: props.label ? 1 : 0,
        display: hidden ? 'none' : 'block',
        '& .MuiFormHelperText-root': {
          fontSize: '0.6875rem',
          ml: '14px'
        },
        ...rest.sx
      }}
      {...rest}
      onValueChange={value => {
        if (disablededit == 'true') return

        onChange && onChange(value.value == '' ? null : value.floatValue)
      }}
      thousandSeparator='.'
      decimalSeparator=','
      decimalScale={0}
      valueIsNumericString
      prefix={prefix}
      suffix={suffix}
      min={min}
      customInput={TextField}
    />
  ) : (
    <NumericFormat
      getInputRef={ref}
      size={size}
      sx={{
        display: hidden ? 'none' : 'block',
        '& .MuiFormHelperText-root': {
          fontSize: '0.6875rem',
          ml: '14px'
        },
        ...rest.sx
      }}
      {...rest}
      onValueChange={value => {
        if (disablededit == 'true') return

        onChange && onChange(value.value == '' ? undefined : value.floatValue)
      }}
      thousandSeparator='.'
      decimalSeparator=','
      decimalScale={0}
      valueIsNumericString
      prefix={prefix}
      suffix={suffix}
      min={min}
      customInput={TextFieldStyled}
    />
  )
})

export default TextFieldNumber
