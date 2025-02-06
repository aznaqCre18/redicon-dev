import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions
} from '@mui/material'
import { useEffect, useState } from 'react'
import DialogEditChip from './dialog/DialogEditChip'
import { useDisclosure } from 'src/hooks/useDisclosure'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

type SelectCustomType = {
  options: Array<any>
  optionKey?: string
  labelKey?: string
  label?: string
  placeholder?: string
  defaultValue?: any
  editable?: boolean
  value?: any
  onSelect?: (value: any) => void
  onSelectAll?: () => void
  onAddButton?: () => void
  onShowButton?: () => void
  error: boolean
  isFloating?: boolean
  multiple?: boolean
  freeSolo?: boolean
  mini?: boolean
  minWidthPaper?: string | number
}

// const pluck = (arr: any[], key: string) => arr.map(i => i[key])

const SelectChip = ({
  options,
  optionKey,
  labelKey,
  label,
  placeholder,
  defaultValue,
  value,
  freeSolo,
  editable = false,
  multiple = true,
  mini = false,
  minWidthPaper,
  onSelectAll,
  onSelect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddButton,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onShowButton,
  isFloating,
  ...props
}: SelectCustomType) => {
  const { t } = useTranslation()
  // dialog state
  const { isOpen, onClose, onOpen } = useDisclosure(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  // Main state
  const [data, setData] = useState(options)
  const [_value, setValue] = useState<any>(
    data.length == 1
      ? multiple
        ? [data[0]]
        : data[0]
      : multiple
      ? defaultValue ?? []
      : defaultValue
  )

  const [inputValue, setInputValue] = useState('')

  const [selectAll, setSelectAll] = useState<boolean>(false)

  const handleToggleSelectAll = () => {
    if (onSelect) {
      if (!selectAll && onSelectAll) onSelectAll()
      else onSelect([])
    }
  }

  const filter = createFilterOptions<any>()

  useEffect(() => {
    setData(options)
  }, [labelKey, optionKey, options])

  useEffect(() => {
    if (value) setValue(data.filter(item => value.includes(item.id)))
  }, [data, value])

  useEffect(() => {
    if (onSelectAll) {
      if (multiple && typeof _value == 'object' && _value.length == data.length) setSelectAll(true)
      else setSelectAll(false)
    }
  }, [_value, data.length, multiple, onSelectAll])

  // const PaperFooter = memo(() =>
  //   onAddButton ? (
  //     <Box
  //       sx={{
  //         display: 'flex'
  //       }}
  //     >
  //       <Button
  //         color='primary'
  //         fullWidth
  //         sx={{ justifyContent: 'flex-start', pl: 2 }}
  //         onMouseDown={() => {
  //           onAddButton()
  //         }}
  //       >
  //         + {t('Add')} {placeholder}
  //       </Button>
  //       {onShowButton && (
  //         <Tooltip title={'Show All ' + placeholder}>
  //           <IconButton onMouseDown={() => onShowButton()}>
  //             <Icon icon='tabler:eye' />
  //           </IconButton>
  //         </Tooltip>
  //       )}
  //     </Box>
  //   ) : null
  // )

  const CustomPaper = ({ children, ...props }: any) => {
    return (
      <Paper
        {...props}
        sx={{
          minWidth: minWidthPaper ?? 'unset'
        }}
      >
        {children}
      </Paper>
    )
  }

  return (
    <>
      <Autocomplete
        value={_value}
        freeSolo={freeSolo}
        multiple={multiple}
        disableCloseOnSelect={multiple}
        autoSelect={!multiple ? true : false}
        size='small'
        onChange={(e, newValue: any) => {
          if (multiple && onSelectAll) {
            if (newValue.find((item: any) => item.all) || newValue == 'Select all') {
              handleToggleSelectAll()

              return
            }
          }

          if (onSelect) onSelect(newValue)
          setValue(newValue)
        }}
        id='merchant-autocomplete'
        options={[
          ...data,
          ...(multiple ? (_value.filter((item: any) => !data.includes(item)) as any) : [])
        ]}
        // defaultValue={
        //   multiple
        //     ? pluckValue.length > 0
        //       ? data.filter(data => pluckValue.includes(optionKey ? data[optionKey] : data))
        //       : []
        //     : pluckValue
        // }
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue)
        }}
        getOptionLabel={(option: any) => (labelKey ? option[labelKey] : option)}
        renderOption={(props, option: any, { selected }) => {
          if (multiple) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { onClick, ...rest } = props

            return (
              <li
                {...props}
                style={{
                  paddingLeft: '4px',
                  paddingRight: '4px'
                }}
              >
                <Checkbox
                  sx={{
                    my: -2.4,
                    mr: '0 !important'
                  }}
                  // icon={icon}
                  // checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={option.all ? !!((value ?? []).length === data.length) : selected}
                />
                {labelKey ? option[labelKey] : option}
                {(labelKey ? option[labelKey] : option) == t('Select all') && (
                  <Box
                    sx={{
                      ml: 'auto'
                    }}
                  >
                    {onAddButton && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()

                          onAddButton()
                        }}
                      >
                        <Icon icon='tabler:plus' />
                      </IconButton>
                    )}
                    {onShowButton && (
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()

                          onShowButton()
                        }}
                      >
                        <Icon icon='tabler:eye' />
                      </IconButton>
                    )}
                  </Box>
                )}
              </li>
            )
          } else {
            return (
              <li {...props}>
                <Box
                  sx={{
                    flexGrow: 1
                  }}
                >
                  {labelKey ? option[labelKey] : option}
                  {(labelKey ? option[labelKey] : option) == t('Select all') && (
                    <Box
                      sx={{
                        ml: 'auto'
                      }}
                    >
                      {onAddButton && (
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()

                            onAddButton()
                          }}
                        >
                          <Icon icon='tabler:plus' />
                        </IconButton>
                      )}
                      {onShowButton && (
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()

                            onShowButton()
                          }}
                        >
                          <Icon icon='tabler:eye' />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>
              </li>
            )
          }
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
                }
              }}
            />
          ) : (
            <TextField
              {...props}
              {...params}
              label={label}
              size='small'
              placeholder={mini && multiple ? '' : `${t('Select')} ` + placeholder}
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
                }
              }}
            />
          )
        }}
        renderTags={(selectedOptions, getTagProps) => {
          if (mini) {
            return (
              <div
                onClick={e => {
                  // get dom element input after this component
                  const open = e.currentTarget.parentElement?.querySelector(
                    'button[aria-label="Open"]'
                  ) as HTMLButtonElement

                  if (open) {
                    open.click()
                  }
                }}
              >
                <Typography variant='body2' color='textSecondary' ml={2}>
                  {selectAll && data.length > 1 && onSelectAll
                    ? t('All') + ' ' + placeholder
                    : selectedOptions.length == 1
                    ? labelKey
                      ? (selectedOptions as any)[0][labelKey]
                      : selectedOptions[0]
                    : selectedOptions.length + ' ' + placeholder + ' ' + t('selected')}
                </Typography>
              </div>
            )
          } else if (selectAll && data.length > 1 && onSelectAll)
            return <Chip label={t('All') + ' ' + placeholder} />
          else
            return (
              <>
                {selectedOptions.map((option: any, index) => (
                  // eslint-disable-next-line react/jsx-key
                  <Tooltip title={editable ? 'Click to edit' : ''} placement='top' key={index}>
                    <Chip
                      clickable={editable}
                      onClick={() => {
                        if (editable) {
                          setSelectedIndex(index)
                          onOpen()
                        }
                      }}
                      label={labelKey ? option[labelKey] : option}
                      {...getTagProps({ index })}
                    />
                  </Tooltip>
                ))}
              </>
            )
        }}
        {...(freeSolo
          ? {
              filterOptions: (options, params) => {
                const filtered = filter(options, params)

                const { inputValue } = params
                // Suggest the creation of a new value
                const isExisting = options.some(option => inputValue === option)
                if (inputValue !== '' && !isExisting) {
                  filtered.push(inputValue)
                }

                console.log(filtered)

                return [...(onSelectAll ? ['All'] : []), ...filtered]
              }
            }
          : {
              filterOptions: (options, params) => {
                const filtered = filter(options, params)

                return [
                  ...(onSelectAll ? [{ [labelKey as any]: t('Select all'), all: true }] : []),
                  ...filtered
                ]
              }
            })}
        PaperComponent={CustomPaper}
      />
      <DialogEditChip
        open={isOpen}
        onClose={onClose}
        data={_value}
        index={selectedIndex}
        onSubmit={value => {
          onClose()

          const newData = [..._value]
          newData[selectedIndex] = value

          setValue(newData)
          if (onSelect) onSelect(newData)
        }}
      />
    </>
  )
}

export default SelectChip
