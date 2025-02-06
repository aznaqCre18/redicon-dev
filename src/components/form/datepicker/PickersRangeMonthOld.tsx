// ** React Imports
import { useState, forwardRef, useEffect } from 'react'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'

// ** Types
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { TextField, styled } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

export const StylePicker = styled('div')(() => ({
  width: 'unset',
  display: 'inline-block',
  '.react-datepicker-wrapper': {
    width: 'unset'
  },
  '.react-datepicker__input-container': {
    width: 'unset'
  }
}))

interface PickerProps {
  label?: string
  end: Date | number
  start: Date | number
}

const PickersRangeMonthOld = ({
  popperPlacement,
  startDate,
  endDate,
  defaultStartDate,
  defaultEndDate,
  onChangeDateRange,
  label = 'Filter by Date'
}: {
  popperPlacement: ReactDatePickerProps['popperPlacement']
  startDate?: DateType
  endDate?: DateType
  defaultStartDate?: DateType
  defaultEndDate?: DateType
  onChangeDateRange?: (start: Date, end: Date) => void
  label?: string | undefined
}) => {
  // ** States
  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(startDate)
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(endDate)

  const handleOnChangeRange = (dates: any) => {
    const [start, end] = dates
    if (
      start == null &&
      startDateRange == defaultStartDate &&
      end == null &&
      endDateRange == defaultEndDate
    )
      return

    if (start == null && end == null) {
      setStartDateRange(defaultStartDate)
      setEndDateRange(defaultEndDate)

      onChangeDateRange && onChangeDateRange(start as Date, end as Date)

      return
    }

    setStartDateRange(start)
    setEndDateRange(end)

    onChangeDateRange && onChangeDateRange(start as Date, end as Date)
  }

  useEffect(() => {
    handleOnChangeRange([startDate, endDate])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const CustomInput = forwardRef((props: PickerProps, ref) => {
    let value = ''
    try {
      const startDate = format(props.start, 'dd/MM/yyyy')
      const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

      value = `${startDate}${endDate !== null ? endDate : ''}`
    } catch (error) {
      value = ''
    }

    return (
      <TextField
        InputProps={{
          startAdornment: (
            <Icon
              icon='ic:twotone-date-range'
              fontSize={18}
              style={{
                marginRight: 5
              }}
            />
          )
        }}
        size='small'
        fullWidth
        sx={{
          minWidth: 238
        }}
        inputRef={ref}
        label={props.label || ''}
        {...props}
        value={value}
      />
    )
  })

  const { t } = useTranslation()

  return (
    <DatePicker
      isClearable
      selectsRange
      monthsShown={2}
      endDate={endDateRange}
      selected={startDateRange}
      startDate={startDateRange}
      id='date-range-picker-months'
      onChange={handleOnChangeRange}
      popperPlacement={popperPlacement}
      customInput={
        <CustomInput
          label={t(label) ?? label}
          end={endDateRange as Date | number}
          start={startDateRange as Date | number}
        />
      }
    />
  )
}

export default PickersRangeMonthOld
