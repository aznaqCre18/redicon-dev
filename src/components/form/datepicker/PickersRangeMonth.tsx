// ** React Imports
import { useState, useEffect } from 'react'

// ** Third Party Imports
import format from 'date-fns/format'

import idLocale from 'date-fns/locale/id'
import enLocale from 'date-fns/locale/en-US'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('id', idLocale)
registerLocale('en', enLocale)

// ** Types
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  TextField,
  styled
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { promise } from 'src/utils/promise'
import { formatDateOnly, isSameDate } from 'src/utils/dateUtils'
import { addDays } from 'date-fns'

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

const today = new Date()
const yesterday = addDays(today, -1)
const last7Days = addDays(today, -7)
const last30Days = addDays(today, -30)
const thisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
const thisWeekEnd = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + (6 - today.getDay())
)
const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
const thisYear = new Date(today.getFullYear(), 0, 1)
const thisYearEnd = new Date(today.getFullYear(), 11, 31)

const ListItemButtonCustom = (data: {
  label: string
  onClick?: () => void
  selected?: boolean
}) => (
  <ListItem disablePadding>
    <ListItemButton
      selected={data.selected}
      onClick={data.onClick}
      sx={{
        px: 3,
        py: 1
      }}
    >
      <ListItemText
        primary={data.label}
        sx={{
          margin: 0
        }}
      />
    </ListItemButton>
  </ListItem>
)

const PickersRangeMonth = ({
  startDate,
  endDate,
  defaultStartDate,
  defaultEndDate,
  onChangeDateRange,
  label = 'Filter by Date',
  hideIconDate
}: {
  startDate?: DateType
  endDate?: DateType
  defaultStartDate?: DateType
  defaultEndDate?: DateType
  onChangeDateRange?: (start: Date, end: Date) => void
  label?: string | undefined
  hideIconDate?: boolean
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

  const handleShowCalender = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseCalender = () => {
    setAnchorEl(null)
  }

  // ** States
  const [startDateRange, setStartDateRange] = useState<DateType | undefined>(startDate)
  const [endDateRange, setEndDateRange] = useState<DateType | undefined>(endDate)

  const handleOnChangeRangeClose = (dates: any) => {
    handleOnChangeRange(dates)

    promise(() => {
      document.getElementById('ok-datepicker')?.click()
    }, 200)
  }

  const handleOnChangeRange = (dates: any) => {
    const [start, end] = dates
    // if (start && end) handleCloseCalender()

    promise(() => {
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

        // onChangeDateRange && onChangeDateRange(start as Date, end as Date)

        return
      }

      setStartDateRange(start)
      setEndDateRange(end)

      // onChangeDateRange && onChangeDateRange(start as Date, end as Date)
    }, 150)
  }

  const handleOk = () => {
    try {
      const startDate = format(startDateRange as Date, 'dd/MM/yyyy')
      const endDate = endDateRange !== null ? format(endDateRange as Date, 'dd/MM/yyyy') : null

      setValue(`${startDate} - ${endDate !== null ? endDate : startDate}`)
    } catch (error) {
      setValue('')
    }

    handleCloseCalender()
    onChangeDateRange &&
      onChangeDateRange(startDateRange as Date, (endDateRange as Date) ?? (startDateRange as Date))
  }

  const handleCancel = () => {
    setStartDateRange(startDate)
    setEndDateRange(endDate)

    handleCloseCalender()
  }

  const resetDateRange = () => {
    console.log('resetDateRange', defaultStartDate, defaultEndDate)

    handleOnChangeRange([defaultStartDate, defaultEndDate])
  }

  useEffect(() => {
    handleOnChangeRange([startDate, endDate])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  let defaultValue = ''
  let valueString = ''
  try {
    const startDate = format(startDateRange as Date, 'dd/MM/yyyy')
    const endDate =
      endDateRange !== null ? ` - ${format(endDateRange as Date, 'dd/MM/yyyy')}` : null

    defaultValue = `${startDate}${endDate !== null ? endDate : ''}`

    const startDateString = formatDateOnly(startDateRange as Date)
    const endDateString = endDateRange !== null ? formatDateOnly(endDateRange as Date) : null

    valueString = `${startDateString}${endDateString !== null ? ` - ${endDateString}` : ''}`
  } catch (error) {
    valueString = ''
  }

  const [value, setValue] = useState<string>(defaultValue)

  const { t } = useTranslation()

  return (
    <StylePicker>
      <TextField
        InputProps={{
          startAdornment: !hideIconDate ? (
            <Icon
              icon='ic:twotone-date-range'
              fontSize={18}
              style={{
                marginRight: 5
              }}
            />
          ) : undefined,
          endAdornment: (
            <InputAdornment
              position='end'
              sx={{
                marginLeft: -2
              }}
            >
              <IconButton edge='end'>
                <Icon icon='ic:round-close' fontSize={18} onClick={resetDateRange} />
              </IconButton>
            </InputAdornment>
          )
        }}
        size='small'
        fullWidth
        label={t(label) || ''}
        value={value}
        onClick={e => handleShowCalender(e)}
        focused={false}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <Box
          sx={{
            display: 'flex'
          }}
        >
          <Box
            sx={{
              borderRight: '1px solid',
              borderRightColor: 'divider'
            }}
          >
            <List>
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, today) &&
                  isSameDate(endDateRange as Date, today)
                }
                label={t('Today')}
                onClick={() => {
                  handleOnChangeRangeClose([today, today])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, yesterday) &&
                  isSameDate(endDateRange as Date, yesterday)
                }
                label={t('Yesterday')}
                onClick={() => {
                  handleOnChangeRangeClose([yesterday, yesterday])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, last7Days) &&
                  isSameDate(endDateRange as Date, today)
                }
                label={t('Last 7 Days')}
                onClick={() => {
                  handleOnChangeRangeClose([last7Days, today])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, last30Days) &&
                  isSameDate(endDateRange as Date, today)
                }
                label={t('Last 30 Days')}
                onClick={() => {
                  handleOnChangeRangeClose([last30Days, today])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, thisWeek) &&
                  isSameDate(endDateRange as Date, thisWeekEnd)
                }
                label={t('This Week')}
                onClick={() => {
                  handleOnChangeRangeClose([thisWeek, thisWeekEnd])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, thisMonth) &&
                  isSameDate(endDateRange as Date, thisMonthEnd)
                }
                label={t('This Month')}
                onClick={() => {
                  handleOnChangeRangeClose([thisMonth, thisMonthEnd])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, lastMonth) &&
                  isSameDate(endDateRange as Date, lastMonthEnd)
                }
                label={t('Last Month')}
                onClick={() => {
                  handleOnChangeRangeClose([lastMonth, lastMonthEnd])
                }}
              />
              <ListItemButtonCustom
                selected={
                  isSameDate(startDateRange as Date, thisYear) &&
                  isSameDate(endDateRange as Date, thisYearEnd)
                }
                label={t('This Year')}
                onClick={() => {
                  handleOnChangeRangeClose([thisYear, thisYearEnd])
                }}
              />
            </List>
          </Box>
          <DatePickerWrapper>
            <Box
              sx={{
                '& .react-datepicker': {
                  boxShadow: 'none'
                }
              }}
            >
              <DatePicker
                locale={(localStorage.getItem('locale') as 'id' | 'en') ?? 'id'}
                selectsRange
                monthsShown={2}
                endDate={endDateRange}
                selected={startDateRange}
                startDate={startDateRange}
                id='date-range-picker-months'
                onChange={handleOnChangeRange}
                inline
              />
              <Divider />
              <Box display={'flex'} justifyContent={'space-between'} p={2}>
                <Box>
                  {/* selected */}
                  <Box fontWeight={'600'}>{valueString}</Box>
                </Box>
                <Box display={'flex'} gap={2}>
                  <Button size='small' onClick={handleCancel}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={handleOk} variant='contained' size='small' id='ok-datepicker'>
                    {t('Process')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </DatePickerWrapper>
        </Box>
      </Popover>
    </StylePicker>
  )
}

export default PickersRangeMonth
