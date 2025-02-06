import { Icon } from '@iconify/react'
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  Box,
  Button,
  IconButton,
  InputProps,
  Paper,
  TextField,
  Tooltip
} from '@mui/material'
import { SyntheticEvent, forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/@core/components/mui/text-field'

type SelectCustomType = {
  disabled?: boolean
  readOnly?: boolean
  sx?: InputProps['sx']
  sxAutoComplete?: InputProps['sx']
  autoCompleteProps?: any
  fullWidth?: boolean
  minWidthPaper?: string | number
  required?: boolean
  nullableText?: string
  options: Array<any>
  optionKey?: string | Array<string>
  labelKey?: string | Array<string>
  label?: string | undefined
  hideLabel?: boolean
  value?: any
  groupBy?: (option: any) => string
  placeholder?: string
  defaultValue?: any
  defaultValueId?: any
  hideOptionDefaultValue?: boolean
  onSelect?: (data: any, value?: any) => void
  onAddButton?: () => void
  onShowButton?: () => void
  error?: boolean
  isFloating?: boolean
  onInputChange?: (
    event: SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void
  serverSide?: boolean
  onChange?: (event: SyntheticEvent<Element, Event>, value: any) => void
  renderLabel?: (option: any) => JSX.Element | string
  noOptionsText?: string
  onFocus?: (bool: boolean) => void
  getOptionDisabled?: (option: any) => boolean
}

const SelectCustom = forwardRef(function SelectCustom(
  {
    disabled = false,
    readOnly = false,
    sx,
    sxAutoComplete,
    autoCompleteProps,
    fullWidth,
    minWidthPaper,
    required,
    nullableText,
    options,
    optionKey,
    labelKey,
    label,
    value,
    groupBy,
    placeholder,
    onSelect,
    onAddButton,
    onShowButton,
    onInputChange,
    renderLabel,
    defaultValue,
    defaultValueId,
    hideOptionDefaultValue,
    isFloating,
    serverSide,
    noOptionsText,
    onFocus,
    getOptionDisabled,
    ..._props
  }: SelectCustomType,
  ref
) {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, ...props } = _props
  const [oldDefaultValueId, setDefaultValueId] = useState<number | undefined>(undefined)
  const [data, setData] = useState(options)
  const [valueState, setValueState] = useState<any>(undefined)

  const [_value, setValue] = useState<any | undefined>(
    defaultValueId &&
      data.filter(
        item =>
          (optionKey
            ? typeof optionKey != 'object'
              ? item[optionKey]
              : item[optionKey[0]][optionKey[1]]
            : item) != defaultValueId
      ).length == 0
      ? typeof defaultValueId != 'object' && optionKey
        ? typeof optionKey != 'object'
          ? data.find(item => item[optionKey] == defaultValueId)
          : data.find(item => item[optionKey[0]][optionKey[1]] == defaultValueId)
        : defaultValueId
      : defaultValue
      ? typeof defaultValue != 'object' && optionKey
        ? typeof optionKey != 'object'
          ? data.find(item => item[optionKey] == defaultValue)
          : data.find(item => item[optionKey[0]][optionKey[1]] == defaultValue)
        : defaultValue
      : data.length == 1
      ? data[0]
      : null
  )

  useEffect(() => {
    setData(options)
  }, [labelKey, optionKey, options])

  useEffect(() => {
    if (value != valueState) {
      setValue(
        value && optionKey
          ? typeof optionKey != 'object'
            ? data.find(item => item[optionKey] == value)
            : data.find(item => item[optionKey[0]][optionKey[1]] == value)
          : value
      )

      setValueState(value)
    }
  }, [data, optionKey, serverSide, value, valueState])

  useEffect(() => {
    if (defaultValueId != oldDefaultValueId && onSelect) {
      setDefaultValueId(defaultValueId)
      const defaultData =
        defaultValueId &&
        !required &&
        optionKey &&
        data.filter(
          item =>
            (optionKey
              ? typeof optionKey != 'object'
                ? item[optionKey]
                : item[optionKey[0]][optionKey[1]]
              : item) != defaultValueId
        ).length == 0
          ? typeof defaultValueId != 'object'
            ? typeof optionKey != 'object'
              ? data.find(item => item[optionKey] == defaultValueId)
              : data.find(item => item[optionKey[0]][optionKey[1]] == defaultValueId)
            : defaultValueId
          : data.length == 1
          ? data[0]
          : null
      setValue(defaultData)
    }
  }, [data, defaultValueId, oldDefaultValueId, onSelect, optionKey, required])

  return (
    <Autocomplete
      {...(onFocus && {
        onFocus: () => onFocus(true),
        onBlur: () => onFocus(false)
      })}
      getOptionDisabled={getOptionDisabled}
      readOnly={readOnly}
      sx={{
        ...sxAutoComplete
      }}
      isOptionEqualToValue={autoCompleteProps?.isOptionEqualToValue}
      disabled={disabled}
      ref={ref}
      fullWidth={fullWidth}
      noOptionsText={noOptionsText}
      value={_value}
      groupBy={groupBy}
      onChange={(e, newData) => {
        if (newData == null) {
          if (!serverSide) {
            const defaultData =
              defaultValueId &&
              !required &&
              data.filter(
                item =>
                  (optionKey
                    ? typeof optionKey != 'object'
                      ? item[optionKey]
                      : item[optionKey[0]][optionKey[1]]
                    : item) != defaultValueId
              ).length == 0
                ? typeof defaultValueId != 'object' && optionKey
                  ? typeof optionKey != 'object'
                    ? data.find(item => item[optionKey] == defaultValueId)
                    : data.find(item => item[optionKey[0]][optionKey[1]] == defaultValueId)
                  : defaultValueId
                : data.length == 1
                ? data[0]
                : null

            setValue(defaultData)
            if (onSelect && defaultData != _value) {
              onSelect(defaultData, !required ? defaultValueId : null)
            }
          }
        } else {
          if (onSelect) {
            if (serverSide) {
              if (onInputChange) onInputChange(null as any, '', 'clear')
            }
            onSelect(
              newData,
              optionKey
                ? typeof optionKey != 'object'
                  ? newData[optionKey]
                  : newData[optionKey[0]][optionKey[1]]
                : newData
            )
          }
        }
      }}
      onInputChange={(event, newInputValue, reason) => {
        if (newInputValue == '')
          if (onSelect) {
            if (serverSide && onInputChange) {
              onInputChange(null as any, '', 'clear')
            }
          }

        // setInputValue(newInputValue)
        if (onInputChange) onInputChange(event, newInputValue, reason)
      }}
      options={
        defaultValueId && hideOptionDefaultValue
          ? data.filter(
              item =>
                (optionKey
                  ? typeof optionKey != 'object'
                    ? item[optionKey]
                    : item[optionKey[0]][optionKey[1]]
                  : item) != defaultValueId
            )
          : data
      }
      // defaultValue={_value}
      getOptionLabel={(option: any) =>
        (renderLabel
          ? renderLabel(option)
          : labelKey
          ? typeof labelKey == 'string'
            ? option[labelKey]
            : option[labelKey[0]]?.[labelKey[1]]
          : option) ?? (!required && required != undefined ? nullableText ?? 'Default' : '')
      }
      renderOption={(props, option: any) => {
        return (
          <li
            {...props}
            key={
              optionKey
                ? typeof optionKey == 'string'
                  ? option[optionKey]
                  : option[optionKey[0]]?.[optionKey[1]]
                : option
            }
          >
            <Box
              sx={{
                flexGrow: 1
              }}
            >
              {renderLabel
                ? renderLabel(option)
                : labelKey
                ? typeof labelKey == 'string'
                  ? option[labelKey]
                  : option[labelKey[0]]?.[labelKey[1]]
                : option}
            </Box>
          </li>
        )
      }}
      renderInput={params => {
        return isFloating == false || isFloating == undefined ? (
          <CustomTextField
            {...props}
            {...params}
            label={label}
            size='small'
            placeholder={`${t('Select')} ` + (placeholder ?? label ?? 'Data')}
            sx={{
              '& .MuiInputBase-root': {
                paddingRight: '2rem !important',
                '& .MuiAutocomplete-endAdornment': {
                  '& .MuiAutocomplete-clearIndicator ': {
                    display: 'none'
                  }
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.6875rem',
                ml: '14px'
              },
              ...sx
            }}
          />
        ) : (
          <TextField
            {...props}
            {...params}
            label={label}
            sx={{
              '& .MuiInputBase-root': {
                paddingRight: '2rem !important',
                '& .MuiAutocomplete-endAdornment': {
                  '& .MuiAutocomplete-clearIndicator ': {
                    display: 'none'
                  }
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.6875rem',
                ml: '14px'
              },
              ...sx
            }}
            size='small'
            placeholder={`${t('Select')} ` + (placeholder ?? label ?? 'Data')}
          />
        )
      }}
      PaperComponent={({ children }) => {
        return (
          <Paper
            sx={{
              minWidth: minWidthPaper ?? 'unset'
            }}
          >
            {children}
            {onAddButton && (
              <Box
                sx={{
                  display: 'flex'
                }}
              >
                <Button
                  color='primary'
                  fullWidth
                  sx={{ justifyContent: 'flex-start', pl: 2 }}
                  onMouseDown={() => {
                    onAddButton()
                  }}
                >
                  + {t('Add')} {placeholder}
                </Button>
                {onShowButton && (
                  <Tooltip title={'Show All ' + placeholder}>
                    <IconButton onMouseDown={() => onShowButton()}>
                      <Icon icon='tabler:eye' />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Paper>
        )
      }}
    />
  )
})

export default SelectCustom
