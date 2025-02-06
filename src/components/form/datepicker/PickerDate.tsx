import { InputAdornment, styled, TextFieldProps, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import PickersComponent, { PickerProps } from './PickersCustomInput'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'

import idLocale from 'date-fns/locale/id'
import enLocale from 'date-fns/locale/en-US'
import { registerLocale } from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

registerLocale('id', idLocale)
registerLocale('en', enLocale)

const StylePicker = styled('div')(() => ({
  marginRight: 14,
  display: 'inline-block',
  width: '100%'
}))

export type PickerDateProps = {
  showTime?: boolean
  onSelectDate?: (date: Date) => void
  hideIconDate?: boolean
  isClearable?: boolean
} & TextFieldProps &
  PickerProps

const PickerDate = (props: PickerDateProps) => {
  const { onSelectDate, hideIconDate, isClearable, label, placeholder, showTime, ...rest } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const { direction } = theme

  const popperPlacement: ReactDatePickerProps['popperPlacement'] =
    direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const [date, setDate] = useState<DateType | undefined>(
    (rest.value
      ? typeof rest.value === 'string'
        ? new Date(rest.value)
        : rest.value
      : undefined) as any
  )

  useEffect(() => {
    if (rest.value) {
      setDate(rest.value as any)
    }
  }, [rest.value])

  return (
    <DatePickerWrapper>
      <StylePicker>
        <ReactDatePicker
          showTimeInput={showTime ?? false}
          isClearable={isClearable}
          locale={localStorage.getItem('locale') === 'en' ? 'en' : 'id'}
          dateFormat={'dd/MM/yyyy' + (showTime ? ' HH:mm' : '')}
          selected={date}
          id='basic-input'
          popperPlacement={popperPlacement}
          onChange={(date: Date) => {
            setDate(date)
            if (onSelectDate) {
              onSelectDate(date)
            }
          }}
          placeholderText={placeholder ?? (t('Select') ?? 'Select') + ' ' + (t('Date') ?? 'Date')}
          customInput={
            <PickersComponent
              label={(label ?? t('Date') ?? 'Date') as string}
              fullWidth
              InputProps={
                hideIconDate
                  ? undefined
                  : {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon icon='ic:baseline-date-range' />
                        </InputAdornment>
                      )
                    }
              }
              {...rest}
            />
          }
        />
      </StylePicker>
    </DatePickerWrapper>
  )
}

export default PickerDate
